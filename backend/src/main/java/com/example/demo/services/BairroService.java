package com.example.demo.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.BairroModel;
import com.example.demo.repositories.BairroRepository;
import com.example.demo.repositories.ImovelRepository;

@Service
public class BairroService {

    @Autowired
    private BairroRepository repository;

    @Autowired
    private ImovelRepository imovelRepository;

    public List<BairroModel> getAll() {
        return repository.findAll();
    }

    public Page<BairroModel> getAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public BairroModel find(Integer id) {
        Optional<BairroModel> model = repository.findById(id);
        return model.orElse(null);
    }

    @Transactional
    public BairroModel insert(BairroModel model) {
        model.setId(null);
        validar(model);
        return repository.save(model);
    }

    @Transactional
    public BairroModel update(BairroModel model) {
        if (find(model.getId()) == null) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Bairro não encontrado.");
        }
        validar(model);
        return repository.save(model);
    }

    // não exclui bairro com imóvel (o imóvel ficaria sem bairro / erro de chave estrangeira)
    @Transactional
    public void delete(Integer id) {
        if (find(id) == null) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Bairro não encontrado.");
        }
        long imoveis = imovelRepository.countByBairroId(id);
        if (imoveis > 0) {
            throw new RegraNegocioException("Este bairro tem " + imoveis + " imóvel(is) cadastrado(s) e não pode ser excluído.");
        }
        repository.deleteById(id);
    }

    private void validar(BairroModel model) {
        if (vazio(model.getNome()) || vazio(model.getCidade()) || vazio(model.getEstado())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe nome, cidade e estado do bairro.");
        }
        model.setEstado(model.getEstado().trim().toUpperCase());
        if (model.getEstado().length() != 2) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "O estado deve ter 2 letras (ex.: RS).");
        }
    }

    private boolean vazio(String texto) {
        return texto == null || texto.isBlank();
    }
}
