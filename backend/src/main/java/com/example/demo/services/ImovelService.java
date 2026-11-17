package com.example.demo.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.StatusImovel;
import com.example.demo.repositories.BairroRepository;
import com.example.demo.repositories.FavoritoRepository;
import com.example.demo.repositories.FotoImovelRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.OfertaRepository;
import com.example.demo.repositories.TipoImovelRepository;

@Service
public class ImovelService {

    private final ImovelRepository repository;
    private final FotoImovelRepository fotoRepository;
    private final FotoImovelService fotoService;
    private final OfertaRepository ofertaRepository;
    private final FavoritoRepository favoritoRepository;
    private final BairroRepository bairroRepository;
    private final TipoImovelRepository tipoRepository;

    public ImovelService(ImovelRepository repository, FotoImovelRepository fotoRepository, FotoImovelService fotoService,
            OfertaRepository ofertaRepository, FavoritoRepository favoritoRepository,
            BairroRepository bairroRepository, TipoImovelRepository tipoRepository) {
        this.repository = repository;
        this.fotoRepository = fotoRepository;
        this.fotoService = fotoService;
        this.ofertaRepository = ofertaRepository;
        this.favoritoRepository = favoritoRepository;
        this.bairroRepository = bairroRepository;
        this.tipoRepository = tipoRepository;
    }

    public List<ImovelModel> getAll() {
        return repository.findAll();
    }

    // vitrine pública (e lista do admin, que filtra por status): filtros opcionais + paginação/ordenação.
    // a faixa de preço vale para o aluguel se a finalidade for ALUGUEL; senão, para a venda.
    @Transactional(readOnly = true)
    public Page<ImovelModel> buscarVitrine(StatusImovel status, String finalidade, Integer tipoId, Integer bairroId,
            Integer dormitorios, BigDecimal precoMin, BigDecimal precoMax, Pageable pageable) {

        if (finalidade != null && finalidade.isBlank()) {
            finalidade = null;
        }

        boolean aluguel = "ALUGUEL".equalsIgnoreCase(finalidade);
        BigDecimal vendaMin = aluguel ? null : precoMin;
        BigDecimal vendaMax = aluguel ? null : precoMax;
        BigDecimal aluguelMin = aluguel ? precoMin : null;
        BigDecimal aluguelMax = aluguel ? precoMax : null;

        Page<ImovelModel> pagina = repository.buscarVitrine(status, finalidade, tipoId, bairroId, dormitorios,
            vendaMin, vendaMax, aluguelMin, aluguelMax, pageable);
        preencherFotoCapa(pagina.getContent());
        return pagina;
    }

    // uma query só para as fotos da lista inteira (vitrine e favoritos) (evita uma consulta por imóvel).
    // a primeira foto de cada imóvel (capa primeiro, depois ordem) vira a capa do card.
    public void preencherFotoCapa(List<ImovelModel> imoveis) {
        if (imoveis.isEmpty()) return;

        List<Integer> ids = new ArrayList<>();
        for (ImovelModel imovel : imoveis) {
            ids.add(imovel.getId());
        }

        Map<Integer, String> capas = new HashMap<>();
        for (Object[] linha : fotoRepository.buscarFotosDosImoveis(ids)) {
            capas.putIfAbsent((Integer) linha[0], (String) linha[1]);
        }

        for (ImovelModel imovel : imoveis) {
            imovel.setFotoCapa(capas.get(imovel.getId()));
        }
    }

    public ImovelModel find(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public ImovelModel insert(ImovelModel model) {
        model.setId(null);
        if (model.getStatus() == null) {
            model.setStatus(StatusImovel.DISPONIVEL);
        }
        validar(model);
        return repository.save(model);
    }

    // null = não existe (controller responde 404)
    @Transactional
    public ImovelModel update(ImovelModel model) {
        ImovelModel atual = find(model.getId());
        if (atual == null) {
            return null;
        }
        if (model.getStatus() == null) {
            model.setStatus(atual.getStatus());
        }
        model.setUsuario(atual.getUsuario()); // o dono não muda pelo formulário
        validar(model);
        return repository.save(model);
    }

    // campos obrigatórios e coerência do preço com a finalidade
    private void validar(ImovelModel model) {
        if (model.getTitulo() == null || model.getTitulo().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe o título do imóvel.");
        }
        String finalidade = model.getFinalidade() == null ? "" : model.getFinalidade().trim().toUpperCase();
        if (!finalidade.equals("VENDA") && !finalidade.equals("ALUGUEL")) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "A finalidade deve ser VENDA ou ALUGUEL.");
        }
        model.setFinalidade(finalidade);

        BigDecimal preco = finalidade.equals("VENDA") ? model.getPrecoVenda() : model.getPrecoAluguel();
        if (preco == null || preco.signum() <= 0) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, finalidade.equals("VENDA")
                ? "Informe o preço de venda (maior que zero)."
                : "Informe o preço do aluguel (maior que zero).");
        }
        if (negativo(model.getPrecoVenda()) || negativo(model.getPrecoAluguel())
                || negativo(model.getAreaTotal()) || negativo(model.getAreaConstruida())
                || negativo(model.getDormitorios()) || negativo(model.getBanheiros()) || negativo(model.getGaragem())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Preços, áreas e quantidades não podem ser negativos.");
        }

        if (model.getTipoImovel() == null || model.getTipoImovel().getId() == null
                || !tipoRepository.existsById(model.getTipoImovel().getId())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha um tipo de imóvel válido.");
        }
        if (model.getBairro() == null || model.getBairro().getId() == null
                || !bairroRepository.existsById(model.getBairro().getId())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha um bairro válido.");
        }
    }

    private boolean negativo(BigDecimal valor) {
        return valor != null && valor.signum() < 0;
    }

    private boolean negativo(Integer valor) {
        return valor != null && valor < 0;
    }

    public ImovelModel updateStatus(Integer id, StatusImovel status) {
        ImovelModel model = find(id);
        if (model == null) return null;
        model.setStatus(status);
        return repository.save(model);
    }

    // imóvel com oferta (e portanto com histórico/contrato) não é excluído.
    // Sem ofertas: apaga junto as fotos (com os arquivos) e os favoritos.
    @Transactional
    public void delete(Integer id) {
        if (find(id) == null) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Imóvel não encontrado.");
        }
        if (ofertaRepository.existsByImovelId(id)) {
            throw new RegraNegocioException("Este imóvel tem ofertas (e talvez contrato) e não pode ser excluído. "
                + "Se não estiver mais à venda, mude o status.");
        }
        fotoService.excluirTodasDoImovel(id);
        favoritoRepository.deleteByImovelId(id);
        repository.deleteById(id);
    }
}
