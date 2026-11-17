package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.demo.models.ImovelModel;
import com.example.demo.services.FavoritoService;

@RestController
@RequestMapping(value = "/favoritos")
public class FavoritoController {

    private final FavoritoService service;

    public FavoritoController(FavoritoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ImovelModel>> listar(Authentication auth) {
        return ResponseEntity.ok(service.listar(auth.getName()));
    }

    // 201 se favoritou agora, 200 se já era favorito
    @PostMapping(value = "/{imovelId}")
    public ResponseEntity<Void> adicionar(@PathVariable Integer imovelId, Authentication auth) {
        boolean criou = service.adicionar(imovelId, auth.getName());
        return ResponseEntity.status(criou ? HttpStatus.CREATED : HttpStatus.OK).build();
    }

    @DeleteMapping(value = "/{imovelId}")
    public ResponseEntity<Void> remover(@PathVariable Integer imovelId, Authentication auth) {
        service.remover(imovelId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
