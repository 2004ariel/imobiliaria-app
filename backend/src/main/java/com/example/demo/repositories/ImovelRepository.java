package com.example.demo.repositories;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.ImovelModel;
import com.example.demo.models.StatusImovel;

public interface ImovelRepository extends JpaRepository<ImovelModel, Integer> {

    // vitrine: cada filtro é opcional (null = não filtra)
    @Query("select i from ImovelModel i where "
        + "(:status is null or i.status = :status) "
        + "and (:finalidade is null or upper(i.finalidade) = upper(:finalidade)) "
        + "and (:tipoId is null or i.tipoImovel.id = :tipoId) "
        + "and (:bairroId is null or i.bairro.id = :bairroId) "
        + "and (:dormitorios is null or i.dormitorios >= :dormitorios) "
        + "and (:vendaMin is null or i.precoVenda >= :vendaMin) "
        + "and (:vendaMax is null or i.precoVenda <= :vendaMax) "
        + "and (:aluguelMin is null or i.precoAluguel >= :aluguelMin) "
        + "and (:aluguelMax is null or i.precoAluguel <= :aluguelMax)")
    Page<ImovelModel> buscarVitrine(
        @Param("status") StatusImovel status,
        @Param("finalidade") String finalidade,
        @Param("tipoId") Integer tipoId,
        @Param("bairroId") Integer bairroId,
        @Param("dormitorios") Integer dormitorios,
        @Param("vendaMin") BigDecimal vendaMin,
        @Param("vendaMax") BigDecimal vendaMax,
        @Param("aluguelMin") BigDecimal aluguelMin,
        @Param("aluguelMax") BigDecimal aluguelMax,
        Pageable pageable);

    // ---- exclusões (não apagar o que está em uso) ----

    long countByBairroId(Integer bairroId);

    long countByTipoImovelId(Integer tipoImovelId);

    boolean existsByUsuarioId(Long usuarioId);

    // ---- painel do admin ----

    long countByStatus(StatusImovel status);

    // [nome do bairro, total]; bairro sem imóvel aparece com 0
    @Query("select b.nome, count(i) from BairroModel b left join ImovelModel i on i.bairro = b "
        + "group by b.id, b.nome order by count(i) desc, b.nome")
    List<Object[]> contarPorBairro();

    // [finalidade, total]; upper() junta "venda" e "VENDA" (a coluna ainda é texto livre)
    @Query("select upper(i.finalidade), count(i) from ImovelModel i where i.finalidade is not null "
        + "group by upper(i.finalidade) order by count(i) desc")
    List<Object[]> contarPorFinalidade();
}
