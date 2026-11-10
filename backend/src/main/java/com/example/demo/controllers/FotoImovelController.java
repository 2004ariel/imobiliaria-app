package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.models.FotoImovelModel;
import com.example.demo.services.FotoImovelService;

@RestController
@RequestMapping(value = "/fotos-imoveis")
public class FotoImovelController {

    private final FotoImovelService service;

    public FotoImovelController(FotoImovelService service) {
        this.service = service;
    }

    // público: fotos de um imóvel (para a página de detalhe)
    @GetMapping(value = "/imovel/{imovelId}")
    public ResponseEntity<List<FotoImovelModel>> listarPorImovel(@PathVariable Integer imovelId) {
        return ResponseEntity.ok(service.listarPorImovel(imovelId));
    }

    // público: devolve a imagem em si (usada no <img src>)
    @GetMapping(value = "/arquivo/{nomeArquivo}")
    public ResponseEntity<byte[]> arquivo(@PathVariable String nomeArquivo) {
        byte[] conteudo = service.lerArquivo(nomeArquivo);
        if (conteudo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(service.tipoDoArquivo(nomeArquivo)))
            .body(conteudo);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> upload(@RequestParam("file") MultipartFile file,
                                       @RequestParam("imovelId") Integer imovelId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            service.salvarFoto(file, imovelId);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (ResponseStatusException e) {
            // imóvel não encontrado -> mantém o 404 lançado pelo service
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
