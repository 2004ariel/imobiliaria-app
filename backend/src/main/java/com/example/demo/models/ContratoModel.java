package com.example.demo.models;

import java.io.Serializable;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

// aprovado = dataAprovacao preenchida. O cliente só enxerga o contrato depois de aprovado.
@Entity
@Table(name = "contratos")
@Getter
@Setter
public class ContratoModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oferta_id", nullable = false)
    private OfertaModel oferta;

    // nome do arquivo dentro de uploads/contratos; o PDF sai por GET /contratos/{id}/pdf
    @JsonIgnore
    @Column(name = "caminho_pdf", nullable = false)
    private String caminhoPdf;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusContrato status;

    @Column(name = "data_assinatura")
    private LocalDateTime dataAssinatura;

    @Column(name = "data_aprovacao")
    private LocalDateTime dataAprovacao;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // só na resposta do "aprovar": false se o e-mail ao cliente falhou (a aprovação vale mesmo assim)
    @Transient
    private Boolean emailEnviado;

    @Override
    public int hashCode() {
        return (id == null) ? 0 : id.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ContratoModel other = (ContratoModel) obj;
        return id != null && id.equals(other.id);
    }
}
