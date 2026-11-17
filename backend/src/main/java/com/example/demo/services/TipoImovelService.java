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
import com.example.demo.models.TipoImovelModel;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.TipoImovelRepository;

@Service
public class TipoImovelService {

    @Autowired
    private TipoImovelRepository repository;

    @Autowired
    private ImovelRepository imovelRepository;

    public List<TipoImovelModel> getAll() {
        return repository.findAll();
    }

    public Page<TipoImovelModel> getAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public TipoImovelModel find(Integer id) {
        Optional<TipoImovelModel> model = repository.findById(id);
        return model.orElse(null);
    }

    @Transactional
    public TipoImovelModel insert(TipoImovelModel model) {
        model.setId(null);
        validar(model);
        return repository.save(model);
    }

    @Transactional
    public TipoImovelModel update(TipoImovelModel model) {
        if (find(model.getId()) == null) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Tipo de imóvel não encontrado.");
        }
        validar(model);
        return repository.save(model);
    }

    // não exclui tipo usado por algum imóvel
    @Transactional
    public void delete(Integer id) {
        if (find(id) == null) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Tipo de imóvel não encontrado.");
        }
        long imoveis = imovelRepository.countByTipoImovelId(id);
        if (imoveis > 0) {
            throw new RegraNegocioException("Este tipo é usado por " + imoveis + " imóvel(is) e não pode ser excluído.");
        }
        repository.deleteById(id);
    }

    private void validar(TipoImovelModel model) {
        if (model.getNome() == null || model.getNome().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe o nome do tipo de imóvel.");
        }
    }
}
