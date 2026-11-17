package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.FavoritoModel;
import com.example.demo.models.ImovelModel;

public interface FavoritoRepository extends JpaRepository<FavoritoModel, Integer> {

    Optional<FavoritoModel> findByUsuarioIdAndImovelId(Long usuarioId, Integer imovelId);

    // devolve direto os imóveis favoritados, do mais recente para o mais antigo
    @Query("select f.imovel from FavoritoModel f where f.usuario.id = :usuarioId order by f.createdAt desc")
    List<ImovelModel> buscarImoveisDoUsuario(@Param("usuarioId") Long usuarioId);
}
