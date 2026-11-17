package com.example.demo.exceptions;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// transforma RegraNegocioException em {"status":409,"error":"mensagem"} (mesmo formato do 401/403 do SecurityConfig)
@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, Object>> regraNegocio(RegraNegocioException e) {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("status", e.getStatus().value());
        corpo.put("error", e.getMessage());
        return ResponseEntity.status(e.getStatus()).body(corpo);
    }
}
