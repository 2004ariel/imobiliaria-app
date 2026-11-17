package com.example.demo.dtos;

import java.math.BigDecimal;

import com.example.demo.models.TipoOferta;

// corpo do POST /ofertas. O usuário vem do token, nunca daqui.
public record OfertaDTO(Integer imovelId, TipoOferta tipo, BigDecimal valorProposto, String mensagem) {
}
