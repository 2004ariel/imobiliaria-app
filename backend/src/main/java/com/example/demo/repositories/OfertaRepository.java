package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.OfertaModel;
import com.example.demo.models.StatusOferta;

public interface OfertaRepository extends JpaRepository<OfertaModel, Integer> {

    boolean existsByImovelId(Integer imovelId);

    boolean existsByUsuarioId(Long usuarioId);

    boolean existsByImovelIdAndUsuarioIdAndStatus(Integer imovelId, Long usuarioId, StatusOferta status);

    List<OfertaModel> findByImovelIdAndStatus(Integer imovelId, StatusOferta status);

    List<OfertaModel> findByImovelIdAndStatusIn(Integer imovelId, List<StatusOferta> status);

    // "join fetch" traz imóvel e usuário na mesma query (sem uma consulta por oferta)
    @Query("select o from OfertaModel o join fetch o.imovel join fetch o.usuario "
        + "where o.usuario.id = :usuarioId order by o.dataCriacao desc")
    List<OfertaModel> buscarDoUsuario(@Param("usuarioId") Long usuarioId);

    // admin: todas, com filtro opcional por status (null = todas)
    @Query(value = "select o from OfertaModel o join fetch o.imovel join fetch o.usuario "
            + "where (:status is null or o.status = :status)",
        countQuery = "select count(o) from OfertaModel o where (:status is null or o.status = :status)")
    Page<OfertaModel> buscarTodas(@Param("status") StatusOferta status, Pageable pageable);

    // ---- painel do admin ----

    long countByStatus(StatusOferta status);

    // [status, total] só dos status que têm oferta
    @Query("select o.status, count(o) from OfertaModel o group by o.status")
    List<Object[]> contarPorStatus();
}
