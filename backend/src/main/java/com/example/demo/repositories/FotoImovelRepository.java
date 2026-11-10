package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.FotoImovelModel;

public interface FotoImovelRepository extends JpaRepository<FotoImovelModel, Integer> {

    List<FotoImovelModel> findByImovelIdOrderByOrdemAsc(Integer imovelId);

    // fotos de vários imóveis de uma vez (vitrine): [imovelId, nomeArquivo], capa primeiro
    @Query("select f.imovel.id, f.nomeArquivo from FotoImovelModel f "
        + "where f.imovel.id in :ids order by f.capa desc, f.ordem asc, f.id asc")
    List<Object[]> buscarFotosDosImoveis(@Param("ids") List<Integer> ids);
}
