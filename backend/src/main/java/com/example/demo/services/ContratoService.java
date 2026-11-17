package com.example.demo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.ContratoModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.OfertaModel;
import com.example.demo.models.StatusContrato;
import com.example.demo.models.StatusImovel;
import com.example.demo.models.StatusOferta;
import com.example.demo.models.TipoOferta;
import com.example.demo.models.UserModel;
import com.example.demo.repositories.ContratoRepository;
import com.example.demo.repositories.OfertaRepository;

// regras dos contratos (enunciado, regras 5 e 6)
@Service
public class ContratoService {

    private static final Logger log = LoggerFactory.getLogger(ContratoService.class);

    private final ContratoRepository repository;
    private final OfertaRepository ofertaRepository;
    private final UserService userService;
    private final EmailService emailService;

    private final Path uploadDir = Paths.get("uploads/contratos"); // relativo à raiz do backend

    public ContratoService(ContratoRepository repository, OfertaRepository ofertaRepository,
            UserService userService, EmailService emailService) {
        this.repository = repository;
        this.ofertaRepository = ofertaRepository;
        this.userService = userService;
        this.emailService = emailService;
    }

    // admin anexa o PDF de uma oferta aceita; nasce aguardando assinatura e ainda não aprovado
    @Transactional
    public ContratoModel criar(Integer ofertaId, MultipartFile arquivo) {
        OfertaModel oferta = ofertaRepository.findById(ofertaId)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Oferta não encontrada."));

        if (oferta.getStatus() != StatusOferta.ACEITA) {
            throw new RegraNegocioException("Só é possível criar contrato para uma oferta aceita.");
        }
        if (repository.existsByOfertaIdAndStatusNot(ofertaId, StatusContrato.CANCELADO)) {
            throw new RegraNegocioException("Esta oferta já tem um contrato ativo.");
        }
        if (arquivo == null || arquivo.isEmpty() || !ehPdf(arquivo)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Envie o contrato em PDF.");
        }

        // o nome é gerado aqui (o nome original do upload não é usado no caminho)
        String nomeArquivo = "contrato_oferta" + ofertaId + "_" + System.currentTimeMillis() + ".pdf";
        try {
            Files.createDirectories(uploadDir);
            arquivo.transferTo(uploadDir.resolve(nomeArquivo).toAbsolutePath().toFile());
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar o PDF do contrato: " + e.getMessage());
        }

        ContratoModel contrato = new ContratoModel();
        contrato.setOferta(oferta);
        contrato.setCaminhoPdf(nomeArquivo);
        contrato.setStatus(StatusContrato.AGUARDANDO_ASSINATURA);
        return repository.save(contrato);
    }

    @Transactional(readOnly = true)
    public Page<ContratoModel> todos(StatusContrato status, Pageable pageable) {
        return repository.buscarTodos(status, pageable);
    }

    @Transactional(readOnly = true)
    public List<ContratoModel> meus(String emailUsuario) {
        UserModel usuario = userService.buscarPorEmail(emailUsuario);
        return repository.buscarAprovadosDoUsuario(usuario.getId());
    }

    // aprova e avisa o cliente por e-mail. Se o e-mail falhar, só registra: a aprovação continua valendo.
    @Transactional
    public ContratoModel aprovar(Integer id) {
        ContratoModel contrato = buscar(id);
        if (contrato.getStatus() != StatusContrato.AGUARDANDO_ASSINATURA) {
            throw new RegraNegocioException("Só é possível aprovar um contrato aguardando assinatura.");
        }
        if (contrato.getDataAprovacao() != null) {
            throw new RegraNegocioException("Este contrato já foi aprovado.");
        }
        contrato.setDataAprovacao(LocalDateTime.now());

        OfertaModel oferta = contrato.getOferta();
        try {
            emailService.enviarEmailComTemplate(
                oferta.getUsuario().getEmail(),
                "Seu contrato está disponível para assinatura",
                "email/contrato",
                Map.of("cliente", oferta.getUsuario(), "imovel", oferta.getImovel(), "oferta", oferta));
            contrato.setEmailEnviado(true);
        } catch (Exception e) {
            log.warn("Contrato {} aprovado, mas o e-mail para {} falhou: {}",
                id, oferta.getUsuario().getEmail(), e.getMessage());
            contrato.setEmailEnviado(false);
        }
        return contrato;
    }

    // regra 6 (também serve como "recusar"): contrato e oferta cancelados, imóvel volta a disponível
    // e as ofertas que estavam em espera voltam a pendentes
    @Transactional
    public ContratoModel cancelar(Integer id) {
        ContratoModel contrato = buscar(id);
        if (contrato.getStatus() != StatusContrato.AGUARDANDO_ASSINATURA) {
            throw new RegraNegocioException("Só é possível cancelar um contrato aguardando assinatura.");
        }

        OfertaModel oferta = contrato.getOferta();
        ImovelModel imovel = oferta.getImovel();

        contrato.setStatus(StatusContrato.CANCELADO);
        oferta.setStatus(StatusOferta.CANCELADA);
        imovel.setStatus(StatusImovel.DISPONIVEL);
        for (OfertaModel outra : ofertaRepository.findByImovelIdAndStatus(imovel.getId(), StatusOferta.EM_ESPERA)) {
            outra.setStatus(StatusOferta.PENDENTE);
        }
        return contrato;
    }

    // regra 5: cliente assina -> imóvel alugado/vendido e as outras ofertas do imóvel são recusadas
    @Transactional
    public ContratoModel assinar(Integer id, String emailUsuario) {
        ContratoModel contrato = buscar(id);
        OfertaModel oferta = contrato.getOferta();

        if (!oferta.getUsuario().getEmail().equals(emailUsuario)) {
            throw new RegraNegocioException(HttpStatus.FORBIDDEN, "Este contrato não é seu.");
        }
        if (contrato.getDataAprovacao() == null) {
            throw new RegraNegocioException("Este contrato ainda não foi aprovado.");
        }
        if (contrato.getStatus() != StatusContrato.AGUARDANDO_ASSINATURA) {
            throw new RegraNegocioException("Este contrato não está aguardando assinatura.");
        }

        ImovelModel imovel = oferta.getImovel();
        contrato.setStatus(StatusContrato.ASSINADO);
        contrato.setDataAssinatura(LocalDateTime.now());
        imovel.setStatus(oferta.getTipo() == TipoOferta.ALUGUEL ? StatusImovel.ALUGADO : StatusImovel.VENDIDO);

        List<StatusOferta> abertas = List.of(StatusOferta.EM_ESPERA, StatusOferta.PENDENTE);
        for (OfertaModel outra : ofertaRepository.findByImovelIdAndStatusIn(imovel.getId(), abertas)) {
            outra.setStatus(StatusOferta.RECUSADA);
        }
        return contrato;
    }

    // admin baixa qualquer um; o cliente só o próprio e depois de aprovado
    @Transactional(readOnly = true)
    public byte[] lerPdf(Integer id, String emailUsuario, boolean admin) {
        ContratoModel contrato = buscar(id);
        if (!admin) {
            boolean dono = contrato.getOferta().getUsuario().getEmail().equals(emailUsuario);
            if (!dono || contrato.getDataAprovacao() == null) {
                throw new RegraNegocioException(HttpStatus.FORBIDDEN, "Acesso negado.");
            }
        }

        // getFileName() garante que nada fora de uploads/contratos é lido
        Path arquivo = uploadDir.resolve(Paths.get(contrato.getCaminhoPdf()).getFileName());
        try {
            return Files.readAllBytes(arquivo);
        } catch (IOException e) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Arquivo do contrato não encontrado.");
        }
    }

    private ContratoModel buscar(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
    }

    // confere a assinatura do arquivo ("%PDF"), não só a extensão
    private boolean ehPdf(MultipartFile arquivo) {
        try {
            byte[] bytes = arquivo.getBytes();
            return bytes.length > 4 && bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F';
        } catch (IOException e) {
            return false;
        }
    }
}
