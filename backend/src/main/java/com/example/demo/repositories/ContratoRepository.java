package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.ContratoModel;
import com.example.demo.models.StatusContrato;

public interface ContratoRepository extends JpaRepository<ContratoModel, Integer> {

    // "ativo" = qualquer status diferente de CANCELADO
    boolean existsByOfertaIdAndStatusNot(Integer ofertaId, StatusContrato status);

    // ids das ofertas (entre as informadas) que já têm contrato não cancelado
    @Query("select c.oferta.id from ContratoModel c where c.oferta.id in :ids and c.status <> :cancelado")
    List<Integer> ofertasComContrato(@Param("ids") List<Integer> ids, @Param("cancelado") StatusContrato cancelado);

    // admin: todos, com filtro opcional por status (null = todos)
    @Query(value = "select c from ContratoModel c join fetch c.oferta o join fetch o.imovel join fetch o.usuario "
            + "where (:status is null or c.status = :status)",
        countQuery = "select count(c) from ContratoModel c where (:status is null or c.status = :status)")
    Page<ContratoModel> buscarTodos(@Param("status") StatusContrato status, Pageable pageable);

    // cliente: só os contratos já aprovados das ofertas dele
    @Query("select c from ContratoModel c join fetch c.oferta o join fetch o.imovel join fetch o.usuario "
        + "where o.usuario.id = :usuarioId and c.dataAprovacao is not null order by c.dataAprovacao desc")
    List<ContratoModel> buscarAprovadosDoUsuario(@Param("usuarioId") Long usuarioId);
}
