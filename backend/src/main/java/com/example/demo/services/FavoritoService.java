package com.example.demo.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.FavoritoModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.UserModel;
import com.example.demo.repositories.FavoritoRepository;
import com.example.demo.repositories.ImovelRepository;

@Service
public class FavoritoService {

    private final FavoritoRepository repository;
    private final ImovelRepository imovelRepository;
    private final ImovelService imovelService;
    private final UserService userService;

    public FavoritoService(FavoritoRepository repository, ImovelRepository imovelRepository,
            ImovelService imovelService, UserService userService) {
        this.repository = repository;
        this.imovelRepository = imovelRepository;
        this.imovelService = imovelService;
        this.userService = userService;
    }

    // imóveis favoritados, já com a foto de capa (para reaproveitar o card da vitrine)
    @Transactional(readOnly = true)
    public List<ImovelModel> listar(String emailUsuario) {
        UserModel usuario = userService.buscarPorEmail(emailUsuario);
        List<ImovelModel> imoveis = repository.buscarImoveisDoUsuario(usuario.getId());
        imovelService.preencherFotoCapa(imoveis);
        return imoveis;
    }

    // devolve true se criou; false se já era favorito (não duplica)
    @Transactional
    public boolean adicionar(Integer imovelId, String emailUsuario) {
        UserModel usuario = userService.buscarPorEmail(emailUsuario);
        ImovelModel imovel = imovelRepository.findById(imovelId)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Imóvel não encontrado."));

        if (repository.findByUsuarioIdAndImovelId(usuario.getId(), imovelId).isPresent()) {
            return false;
        }

        FavoritoModel favorito = new FavoritoModel();
        favorito.setUsuario(usuario);
        favorito.setImovel(imovel);
        repository.save(favorito);
        return true;
    }

    // remover algo que não é favorito não é erro
    @Transactional
    public void remover(Integer imovelId, String emailUsuario) {
        UserModel usuario = userService.buscarPorEmail(emailUsuario);
        repository.findByUsuarioIdAndImovelId(usuario.getId(), imovelId).ifPresent(repository::delete);
    }
}
