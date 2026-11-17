package com.example.demo.controllers;

import java.math.BigDecimal;
import java.net.URI;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.dtos.SaberMaisDTO;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.StatusImovel;
import com.example.demo.services.EmailService;
import com.example.demo.services.ImovelService;

@RestController
@RequestMapping(value = "/imoveis")
public class ImovelController {

    private final ImovelService service;
    private final EmailService emailService;

    public ImovelController(ImovelService service, EmailService emailService) {
        this.service = service;
        this.emailService = emailService;
    }

    // vitrine pública: /imoveis?page=0&size=9&sort=precoVenda,asc&finalidade=VENDA&bairroId=1&precoMin=100000
    // admin usa também ?status=DISPONIVEL
    @GetMapping
    public ResponseEntity<Page<ImovelModel>> getAll(
            @RequestParam(required = false) StatusImovel status,
            @RequestParam(required = false) String finalidade,
            @RequestParam(required = false) Integer tipoId,
            @RequestParam(required = false) Integer bairroId,
            @RequestParam(required = false) Integer dormitorios,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            Pageable pageable) {
        return ResponseEntity.ok(service.buscarVitrine(
            status, finalidade, tipoId, bairroId, dormitorios, precoMin, precoMax, pageable));
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ImovelModel> find(@PathVariable Integer id) {
        ImovelModel model = service.find(id);
        if (model == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(model);
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody ImovelModel model) {
        model = service.insert(model);
        URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}")
            .buildAndExpand(model.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Void> update(@RequestBody ImovelModel model, @PathVariable Integer id) {
        model.setId(id);
        if (service.update(model) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    // só ADMIN (ajuste manual); no fluxo normal o status muda pelas ofertas/contratos.
    // body {"status": "VENDIDO"}; valor fora do enum -> 400
    @PatchMapping(value = "/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Integer id, @RequestBody Map<String, StatusImovel> body) {
        if (body.get("status") == null) {
            return ResponseEntity.badRequest().build();
        }
        if (service.updateStatus(id, body.get("status")) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // cliente quer saber mais sobre o imóvel -> envia email com template
    @PostMapping(value = "/sabermais/{id}")
    public ResponseEntity<String> saberMais(@PathVariable Integer id, @RequestBody SaberMaisDTO dto) {
        ImovelModel imovel = service.find(id);
        if (imovel == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            emailService.enviarEmailComTemplate(
                dto.getEmail(),
                "Informações sobre o imóvel",
                "email/sabermais",
                Map.of(
                    "cliente", dto,
                    "imovel", imovel,
                    "mensagem", "Obrigado pelo interesse! Em breve um corretor vai entrar em contato."
                ));

            return ResponseEntity.ok("Enviado");
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
