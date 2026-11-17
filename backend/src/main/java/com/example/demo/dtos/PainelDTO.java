package com.example.demo.dtos;

import java.util.List;

import com.example.demo.models.StatusOferta;

// resposta do GET /painel (tudo contado no banco)
public record PainelDTO(
        Totais totais,
        List<PorBairro> imoveisPorBairro,
        List<PorStatus> ofertasPorSituacao,
        List<PorFinalidade> imoveisPorFinalidade) {

    public record Totais(long imoveisDisponiveis, long ofertasPendentes, long contratosAguardandoAssinatura) {
    }

    public record PorBairro(String nome, long total) {
    }

    public record PorStatus(StatusOferta status, long total) {
    }

    public record PorFinalidade(String finalidade, long total) {
    }
}
