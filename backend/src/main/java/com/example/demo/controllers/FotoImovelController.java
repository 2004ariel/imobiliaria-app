package com.example.demo.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.models.FotoImovelModel;
import com.example.demo.services.FotoImovelService;

// erros de regra (imóvel inexistente, arquivo que não é imagem) saem pelo TratadorDeErros
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

    // ADMIN: multipart com "file" (imagem) e "imovelId"
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoImovelModel> upload(@RequestParam("file") MultipartFile file,
                                                  @RequestParam("imovelId") Integer imovelId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvarFoto(file, imovelId));
    }

    // ADMIN: body {"capa": true, "ordem": 2} (os dois opcionais)
    @PutMapping(value = "/{id}")
    public ResponseEntity<FotoImovelModel> atualizar(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Boolean capa = body.get("capa") instanceof Boolean b ? b : null;
        Integer ordem = body.get("ordem") instanceof Number n ? n.intValue() : null;
        return ResponseEntity.ok(service.atualizar(id, capa, ordem));
    }

    // ADMIN: apaga o registro e o arquivo
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
