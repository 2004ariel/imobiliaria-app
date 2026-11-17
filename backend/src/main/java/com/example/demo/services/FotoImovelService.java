package com.example.demo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.FotoImovelModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.FotoImovelRepository;
import com.example.demo.repositories.ImovelRepository;

@Service
public class FotoImovelService {

    private static final Set<String> EXTENSOES = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final FotoImovelRepository repository;
    private final ImovelRepository imovelRepository;

    private final Path uploadDir = Paths.get("uploads/fotos"); // diretório de upload (relativo à raiz do projeto)

    public FotoImovelService(FotoImovelRepository repository, ImovelRepository imovelRepository) {
        this.repository = repository;
        this.imovelRepository = imovelRepository;
    }

    public List<FotoImovelModel> listarPorImovel(Integer imovelId) {
        return repository.findByImovelIdOrderByOrdemAsc(imovelId);
    }

    // lê o arquivo da foto do disco; null se não existir.
    // getFileName() descarta qualquer "../" vindo da URL.
    public byte[] lerArquivo(String nomeArquivo) {
        Path arquivo = uploadDir.resolve(Paths.get(nomeArquivo).getFileName());
        try {
            if (!Files.exists(arquivo)) return null;
            return Files.readAllBytes(arquivo);
        } catch (IOException e) {
            return null;
        }
    }

    public String tipoDoArquivo(String nomeArquivo) {
        try {
            String tipo = Files.probeContentType(uploadDir.resolve(Paths.get(nomeArquivo).getFileName()));
            return tipo != null ? tipo : "application/octet-stream";
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }

    // só imagem; a primeira foto do imóvel já vira capa e as próximas vão para o fim da ordem
    @Transactional
    public FotoImovelModel salvarFoto(MultipartFile file, Integer imovelId) {
        ImovelModel imovel = imovelRepository.findById(imovelId)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Imóvel não encontrado."));

        if (file == null || file.isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha uma imagem.");
        }
        String nomeOriginal = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extensao = StringUtils.getFilenameExtension(nomeOriginal);
        String tipo = file.getContentType();
        if (extensao == null || !EXTENSOES.contains(extensao.toLowerCase()) || tipo == null || !tipo.startsWith("image/")) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Envie uma imagem (JPG, PNG, WEBP ou GIF).");
        }

        List<FotoImovelModel> existentes = listarPorImovel(imovelId);
        int proximaOrdem = existentes.isEmpty() ? 1 : existentes.get(existentes.size() - 1).getOrdem() + 1;

        try {
            Files.createDirectories(uploadDir);
            // só o nome do arquivo (sem pastas) entra no nome salvo
            String novoNomeArquivo = System.currentTimeMillis() + "_" + Paths.get(nomeOriginal).getFileName();
            Path destino = uploadDir.resolve(novoNomeArquivo).toAbsolutePath();
            file.transferTo(destino.toFile());

            FotoImovelModel foto = new FotoImovelModel();
            foto.setNomeArquivo(novoNomeArquivo);
            foto.setCaminhoArquivo(destino.toString());
            foto.setCapa(existentes.isEmpty());
            foto.setOrdem(proximaOrdem);
            foto.setImovel(imovel);
            return repository.save(foto);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar a foto do imóvel: " + e.getMessage());
        }
    }

    // capa = true desmarca as outras fotos do mesmo imóvel (só uma capa)
    @Transactional
    public FotoImovelModel atualizar(Integer id, Boolean capa, Integer ordem) {
        FotoImovelModel foto = buscar(id);
        if (ordem != null) {
            if (ordem < 1) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "A ordem deve ser 1 ou maior.");
            }
            foto.setOrdem(ordem);
        }
        if (Boolean.TRUE.equals(capa)) {
            for (FotoImovelModel outra : listarPorImovel(foto.getImovel().getId())) {
                outra.setCapa(outra.getId().equals(foto.getId()));
            }
        } else if (Boolean.FALSE.equals(capa)) {
            foto.setCapa(false);
        }
        return foto;
    }

    // apaga o registro e o arquivo; se era a capa, a próxima foto vira capa
    @Transactional
    public void excluir(Integer id) {
        FotoImovelModel foto = buscar(id);
        Integer imovelId = foto.getImovel().getId();
        boolean eraCapa = Boolean.TRUE.equals(foto.getCapa());

        repository.delete(foto);
        apagarArquivo(foto.getNomeArquivo());

        if (eraCapa) {
            listarPorImovel(imovelId).stream()
                .filter(f -> !f.getId().equals(id))
                .findFirst()
                .ifPresent(f -> f.setCapa(true));
        }
    }

    // usado ao excluir o imóvel inteiro
    @Transactional
    public void excluirTodasDoImovel(Integer imovelId) {
        for (FotoImovelModel foto : listarPorImovel(imovelId)) {
            repository.delete(foto);
            apagarArquivo(foto.getNomeArquivo());
        }
    }

    private FotoImovelModel buscar(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Foto não encontrada."));
    }

    private void apagarArquivo(String nomeArquivo) {
        try {
            Files.deleteIfExists(uploadDir.resolve(Paths.get(nomeArquivo).getFileName()));
        } catch (IOException e) {
            // o registro já saiu do banco; um arquivo órfão não quebra nada
        }
    }
}
