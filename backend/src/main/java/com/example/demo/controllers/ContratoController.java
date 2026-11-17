package com.example.demo.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.models.ContratoModel;
import com.example.demo.models.StatusContrato;
import com.example.demo.services.ContratoService;

@RestController
@RequestMapping(value = "/contratos")
public class ContratoController {

    private final ContratoService service;

    public ContratoController(ContratoService service) {
        this.service = service;
    }

    // admin: multipart com o campo "file" (PDF)
    @PostMapping(value = "/oferta/{ofertaId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContratoModel> criar(@PathVariable Integer ofertaId,
                                               @RequestParam("file") MultipartFile file) {
        ContratoModel contrato = service.criar(ofertaId, file);
        URI uri = ServletUriComponentsBuilder
            .fromCurrentContextPath().path("/contratos/{id}")
            .buildAndExpand(contrato.getId()).toUri();
        return ResponseEntity.created(uri).body(contrato);
    }

    // admin: /contratos?status=AGUARDANDO_ASSINATURA&page=0&size=10&sort=createdAt,desc
    @GetMapping
    public ResponseEntity<Page<ContratoModel>> todos(
            @RequestParam(required = false) StatusContrato status, Pageable pageable) {
        return ResponseEntity.ok(service.todos(status, pageable));
    }

    @PatchMapping(value = "/{id}/aprovar")
    public ResponseEntity<ContratoModel> aprovar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.aprovar(id));
    }

    @PatchMapping(value = "/{id}/cancelar")
    public ResponseEntity<ContratoModel> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.cancelar(id));
    }

    // cliente: só os aprovados
    @GetMapping(value = "/meus")
    public ResponseEntity<List<ContratoModel>> meus(Authentication auth) {
        return ResponseEntity.ok(service.meus(auth.getName()));
    }

    @PatchMapping(value = "/{id}/assinar")
    public ResponseEntity<ContratoModel> assinar(@PathVariable Integer id, Authentication auth) {
        return ResponseEntity.ok(service.assinar(id, auth.getName()));
    }

    // admin ou o dono (se aprovado)
    @GetMapping(value = "/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Integer id, Authentication auth) {
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        byte[] conteudo = service.lerPdf(id, auth.getName(), admin);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"contrato-" + id + ".pdf\"")
            .body(conteudo);
    }
}
