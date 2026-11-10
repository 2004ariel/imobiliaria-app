package com.example.demo.services;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.ImovelRepository;

@Service
public class ImovelService {

    private final ImovelRepository repository;

    public ImovelService(ImovelRepository repository) {
        this.repository = repository;
    }

    public List<ImovelModel> getAll() {
        return repository.findAll();
    }

    // vitrine pública: filtros opcionais + paginação/ordenação.
    // a faixa de preço vale para o aluguel se a finalidade for ALUGUEL; senão, para a venda.
    @Transactional(readOnly = true)
    public Page<ImovelModel> buscarVitrine(String finalidade, Integer tipoId, Integer bairroId,
            Integer dormitorios, BigDecimal precoMin, BigDecimal precoMax, Pageable pageable) {

        if (finalidade != null && finalidade.isBlank()) {
            finalidade = null;
        }

        boolean aluguel = "ALUGUEL".equalsIgnoreCase(finalidade);
        BigDecimal vendaMin = aluguel ? null : precoMin;
        BigDecimal vendaMax = aluguel ? null : precoMax;
        BigDecimal aluguelMin = aluguel ? precoMin : null;
        BigDecimal aluguelMax = aluguel ? precoMax : null;

        return repository.buscarVitrine(finalidade, tipoId, bairroId, dormitorios,
            vendaMin, vendaMax, aluguelMin, aluguelMax, pageable);
    }

    public ImovelModel find(Integer id) {
        return repository.findById(id).orElse(null);
    }

    public ImovelModel insert(ImovelModel model) {
        return repository.save(model);
    }

    public ImovelModel update(ImovelModel model) {
        if (find(model.getId()) != null) {
            return repository.save(model);
        }
        return null;
    }

    public ImovelModel updateStatus(Integer id, String status) {
        ImovelModel model = find(id);
        if (model == null) return null;
        model.setStatus(status);
        return repository.save(model);
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
