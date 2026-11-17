package com.example.demo.controllers;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.dtos.UserDTO;
import com.example.demo.models.UserModel;
import com.example.demo.services.UserService;

// só ADMIN (SecurityConfig). A resposta é sempre UserDTO: a senha nunca sai no JSON.
@RestController
@RequestMapping(value = "/users")
public class UserController {

    @Autowired
    private UserService userService;

    // /users?busca=maria (nome ou e-mail)
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam(required = false) String busca) {
        List<UserDTO> dtos = userService.buscar(busca).stream().map(UserDTO::new).toList();
        return ResponseEntity.status(HttpStatus.OK).body(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        Optional<UserModel> usuarioExiste = userService.find(id);
        if (usuarioExiste.isPresent()) {
            return ResponseEntity.ok(new UserDTO(usuarioExiste.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO dto) {
        UserModel savedUser = userService.insert(dto);
        URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}")
            .buildAndExpand(savedUser.getId()).toUri();
        return ResponseEntity.created(uri).body(new UserDTO(savedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateUser(@PathVariable Long id, @RequestBody UserDTO dto, Authentication auth) {
        if (userService.updateFromDto(id, dto, auth.getName()) != null) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // o admin logado não pode excluir a si mesmo (409)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication auth) {
        userService.excluir(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
