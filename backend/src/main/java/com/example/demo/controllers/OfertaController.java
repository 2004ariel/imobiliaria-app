package com.example.demo.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.dtos.OfertaDTO;
import com.example.demo.models.OfertaModel;
import com.example.demo.models.StatusOferta;
import com.example.demo.services.OfertaService;

// auth.getName() = email do token (subject do JWT). O usuário nunca vem do body.
@RestController
@RequestMapping(value = "/ofertas")
public class OfertaController {

    private final OfertaService service;

    public OfertaController(OfertaService service) {
        this.service = service;
    }

    // cliente: body {"imovelId": 1, "tipo": "VENDA", "valorProposto": 450000, "mensagem": "..."}
    @PostMapping
    public ResponseEntity<OfertaModel> criar(@RequestBody OfertaDTO dto, Authentication auth) {
        OfertaModel oferta = service.criar(dto, auth.getName());
        URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}")
            .buildAndExpand(oferta.getId()).toUri();
        return ResponseEntity.created(uri).body(oferta);
    }

    @GetMapping(value = "/minhas")
    public ResponseEntity<List<OfertaModel>> minhas(Authentication auth) {
        return ResponseEntity.ok(service.minhas(auth.getName()));
    }

    @PatchMapping(value = "/{id}/cancelar")
    public ResponseEntity<OfertaModel> cancelar(@PathVariable Integer id, Authentication auth) {
        return ResponseEntity.ok(service.cancelar(id, auth.getName()));
    }

    // admin: /ofertas?status=PENDENTE&page=0&size=10&sort=dataCriacao,desc
    @GetMapping
    public ResponseEntity<Page<OfertaModel>> todas(
            @RequestParam(required = false) StatusOferta status, Pageable pageable) {
        return ResponseEntity.ok(service.todas(status, pageable));
    }

    @PatchMapping(value = "/{id}/aceitar")
    public ResponseEntity<OfertaModel> aceitar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.aceitar(id));
    }

    @PatchMapping(value = "/{id}/recusar")
    public ResponseEntity<OfertaModel> recusar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.recusar(id));
    }
}
