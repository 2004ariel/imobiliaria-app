package com.example.demo.exceptions;

import org.springframework.http.HttpStatus;

// erro de regra de negócio lançado pelos services. Padrão 409; dá para usar 404/403 quando fizer sentido.
public class RegraNegocioException extends RuntimeException {

    private final HttpStatus status;

    public RegraNegocioException(String mensagem) {
        this(HttpStatus.CONFLICT, mensagem);
    }

    public RegraNegocioException(HttpStatus status, String mensagem) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
