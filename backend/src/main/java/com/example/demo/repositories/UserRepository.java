package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.UserModel;

public interface UserRepository extends JpaRepository<UserModel, Long> {

    Optional<UserModel> findByEmail(String email);

    // busca por nome ou e-mail (null = todos), sem diferenciar maiúsculas
    @Query("select u from UserModel u where :busca is null "
        + "or lower(u.nome) like lower(concat('%', :busca, '%')) "
        + "or lower(u.email) like lower(concat('%', :busca, '%')) order by u.nome")
    List<UserModel> buscar(@Param("busca") String busca);
}
