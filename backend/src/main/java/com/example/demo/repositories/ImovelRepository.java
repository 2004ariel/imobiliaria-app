package com.example.demo.repositories;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.ImovelModel;

public interface ImovelRepository extends JpaRepository<ImovelModel, Integer> {

    // vitrine: cada filtro é opcional (null = não filtra)
    @Query("select i from ImovelModel i where "
        + "(:finalidade is null or upper(i.finalidade) = upper(:finalidade)) "
        + "and (:tipoId is null or i.tipoImovel.id = :tipoId) "
        + "and (:bairroId is null or i.bairro.id = :bairroId) "
        + "and (:dormitorios is null or i.dormitorios >= :dormitorios) "
        + "and (:vendaMin is null or i.precoVenda >= :vendaMin) "
        + "and (:vendaMax is null or i.precoVenda <= :vendaMax) "
        + "and (:aluguelMin is null or i.precoAluguel >= :aluguelMin) "
        + "and (:aluguelMax is null or i.precoAluguel <= :aluguelMax)")
    Page<ImovelModel> buscarVitrine(
        @Param("finalidade") String finalidade,
        @Param("tipoId") Integer tipoId,
        @Param("bairroId") Integer bairroId,
        @Param("dormitorios") Integer dormitorios,
        @Param("vendaMin") BigDecimal vendaMin,
        @Param("vendaMax") BigDecimal vendaMax,
        @Param("aluguelMin") BigDecimal aluguelMin,
        @Param("aluguelMax") BigDecimal aluguelMax,
        Pageable pageable);
}
