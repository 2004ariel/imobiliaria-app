package com.example.demo.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.OfertaDTO;
import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.OfertaModel;
import com.example.demo.models.StatusContrato;
import com.example.demo.models.StatusImovel;
import com.example.demo.models.StatusOferta;
import com.example.demo.models.TipoOferta;
import com.example.demo.models.UserModel;
import com.example.demo.repositories.ContratoRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.OfertaRepository;

// regras de negócio das ofertas (enunciado, regras 1 a 4)
@Service
public class OfertaService {

    private final OfertaRepository repository;
    private final ImovelRepository imovelRepository;
    private final UserService userService;
    private final ContratoRepository contratoRepository;

    public OfertaService(OfertaRepository repository, ImovelRepository imovelRepository, UserService userService,
            ContratoRepository contratoRepository) {
        this.repository = repository;
        this.imovelRepository = imovelRepository;
        this.userService = userService;
        this.contratoRepository = contratoRepository;
    }

    @Transactional
    public OfertaModel criar(OfertaDTO dto, String emailUsuario) {
        UserModel usuario = userService.buscarPorEmail(emailUsuario);

        if (dto.imovelId() == null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe o imóvel.");
        }
        ImovelModel imovel = imovelRepository.findById(dto.imovelId())
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Imóvel não encontrado."));

        // regra 1: só imóvel disponível recebe oferta
        if (imovel.getStatus() != StatusImovel.DISPONIVEL) {
            throw new RegraNegocioException("Este imóvel não está disponível para ofertas.");
        }

        if (dto.tipo() == null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe o tipo da oferta (VENDA ou ALUGUEL).");
        }
        BigDecimal preco = dto.tipo() == TipoOferta.VENDA ? imovel.getPrecoVenda() : imovel.getPrecoAluguel();
        if (preco == null || preco.signum() <= 0) {
            throw new RegraNegocioException(dto.tipo() == TipoOferta.VENDA
                ? "Este imóvel não está à venda."
                : "Este imóvel não está para alugar.");
        }

        if (dto.valorProposto() == null || dto.valorProposto().signum() <= 0) {
            throw new RegraNegocioException("O valor proposto precisa ser maior que zero.");
        }

        // regra 2: no máximo uma oferta pendente por cliente em cada imóvel
        if (repository.existsByImovelIdAndUsuarioIdAndStatus(imovel.getId(), usuario.getId(), StatusOferta.PENDENTE)) {
            throw new RegraNegocioException("Você já tem uma oferta pendente para este imóvel.");
        }

        OfertaModel oferta = new OfertaModel();
        oferta.setImovel(imovel);
        oferta.setUsuario(usuario);
        oferta.setTipo(dto.tipo());
        oferta.setValorProposto(dto.valorProposto());
        oferta.setMensagem(dto.mensagem());
        oferta.setStatus(StatusOferta.PENDENTE);
        return repository.save(oferta);
    }

    @Transactional(readOnly = true)
    public List<OfertaModel> minhas(String emailUsuario) {
        UserModel usuario = userService.buscarPorEmail(emailUsuario);
        return repository.buscarDoUsuario(usuario.getId());
    }

    @Transactional(readOnly = true)
    public Page<OfertaModel> todas(StatusOferta status, Pageable pageable) {
        Page<OfertaModel> pagina = repository.buscarTodas(status, pageable);
        preencherTemContrato(pagina.getContent());
        return pagina;
    }

    // uma query só para a página inteira: quais ofertas já têm contrato (o admin não prepara outro)
    private void preencherTemContrato(List<OfertaModel> ofertas) {
        if (ofertas.isEmpty()) return;
        List<Integer> ids = new ArrayList<>();
        for (OfertaModel oferta : ofertas) {
            ids.add(oferta.getId());
        }
        List<Integer> comContrato = contratoRepository.ofertasComContrato(ids, StatusContrato.CANCELADO);
        for (OfertaModel oferta : ofertas) {
            oferta.setTemContrato(comContrato.contains(oferta.getId()));
        }
    }

    // regra 4: aceita esta, reserva o imóvel e põe as outras pendentes em espera
    @Transactional
    public OfertaModel aceitar(Integer id) {
        OfertaModel oferta = buscarPendente(id);
        ImovelModel imovel = oferta.getImovel();

        if (imovel.getStatus() != StatusImovel.DISPONIVEL) {
            throw new RegraNegocioException("O imóvel desta oferta não está mais disponível.");
        }

        oferta.setStatus(StatusOferta.ACEITA);
        imovel.setStatus(StatusImovel.RESERVADO);

        for (OfertaModel outra : repository.findByImovelIdAndStatus(imovel.getId(), StatusOferta.PENDENTE)) {
            if (!outra.getId().equals(oferta.getId())) {
                outra.setStatus(StatusOferta.EM_ESPERA);
            }
        }
        return oferta;
    }

    @Transactional
    public OfertaModel recusar(Integer id) {
        OfertaModel oferta = buscarPendente(id);
        oferta.setStatus(StatusOferta.RECUSADA);
        return oferta;
    }

    // só o dono da oferta cancela, e só enquanto está pendente
    @Transactional
    public OfertaModel cancelar(Integer id, String emailUsuario) {
        OfertaModel oferta = buscar(id);
        if (!oferta.getUsuario().getEmail().equals(emailUsuario)) {
            throw new RegraNegocioException(HttpStatus.FORBIDDEN, "Esta oferta não é sua.");
        }
        if (oferta.getStatus() != StatusOferta.PENDENTE) {
            throw new RegraNegocioException("Só é possível cancelar uma oferta pendente.");
        }
        oferta.setStatus(StatusOferta.CANCELADA);
        return oferta;
    }

    private OfertaModel buscar(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Oferta não encontrada."));
    }

    private OfertaModel buscarPendente(Integer id) {
        OfertaModel oferta = buscar(id);
        if (oferta.getStatus() != StatusOferta.PENDENTE) {
            throw new RegraNegocioException("Só é possível responder uma oferta pendente.");
        }
        return oferta;
    }
}
