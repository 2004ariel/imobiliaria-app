package com.example.demo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.models.FotoImovelModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.FotoImovelRepository;

@Service
public class FotoImovelService {

    private final FotoImovelRepository repository;
    private final ImovelService imovelService;

    private final Path uploadDir = Paths.get("uploads/fotos"); // diretório de upload (relativo à raiz do projeto)

    public FotoImovelService(FotoImovelRepository repository, ImovelService imovelService) {
        this.repository = repository;
        this.imovelService = imovelService;
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

    public FotoImovelModel salvarFoto(MultipartFile file, Integer imovelId) {
        // 1 -> procurar se existe o imóvel para associar a foto; se não existir, lançar exceção
        ImovelModel imovel = imovelService.find(imovelId);
        if (imovel == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado com o ID: " + imovelId);
        }

        try {
            // 2 -> criar o diretório de uploads
            Files.createDirectories(uploadDir);

            // 3 -> renomear e mover o arquivo para o diretório de upload
            String nomeOriginal = StringUtils.cleanPath(file.getOriginalFilename());
            String novoNomeArquivo = System.currentTimeMillis() + "_" + nomeOriginal;
            Path destino = uploadDir.resolve(novoNomeArquivo).toAbsolutePath();
            file.transferTo(destino.toFile());

            // 4 -> criar o modelo e salvar no banco de dados
            FotoImovelModel fotoImovel = new FotoImovelModel();
            fotoImovel.setNomeArquivo(novoNomeArquivo);
            fotoImovel.setCaminhoArquivo(destino.toString());
            fotoImovel.setCapa(false); // defina como true se for a capa
            fotoImovel.setOrdem(1); // defina a ordem conforme necessário
            fotoImovel.setImovel(imovel);
            return repository.save(fotoImovel);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar a foto do imóvel: " + e.getMessage());
        }
    }
}
