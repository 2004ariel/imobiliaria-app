package com.example.demo.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.HttpStatus;

import com.example.demo.dtos.RegisterDTO;
import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.dtos.UserDTO;
import com.example.demo.models.TipoUsuario;
import com.example.demo.models.UserModel;
import com.example.demo.repositories.FavoritoRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.OfertaRepository;
import com.example.demo.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private ImovelRepository imovelRepository;

    @Autowired
    private FavoritoRepository favoritoRepository;

    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    // admin: busca por nome ou e-mail (vazio = todos)
    public List<UserModel> buscar(String busca) {
        return userRepository.buscar(busca == null || busca.isBlank() ? null : busca.trim());
    }

    public Optional<UserModel> find(Long id) {
        return userRepository.findById(id);
    }

    // usuário logado: o email vem do token (subject do JWT)
    public UserModel buscarPorEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.UNAUTHORIZED, "Usuário do token não encontrado."));
    }

    public UserModel save(UserModel user) {
        return userRepository.save(user);
    }

    public Optional<UserModel> update(Long id, UserModel user) {
        Optional<UserModel> usuarioExiste = find(id);
        if (usuarioExiste.isPresent()) {
            UserModel existingUser = usuarioExiste.get();
            existingUser.setNome(user.getNome());
            existingUser.setEmail(user.getEmail());
            existingUser.setSenha(passwordEncoder.encode(user.getSenha()));
            existingUser.setTipo(user.getTipo());
            return Optional.of(userRepository.save(existingUser));
        }
        return Optional.empty();
    }

    // admin cadastra: nome, e-mail válido e único, senha (mín. 4) e perfil (padrão USER)
    @Transactional
    public UserModel insert(UserDTO dto) {
        validar(dto, null, true);
        if (dto.getTipo() == null) dto.setTipo(TipoUsuario.USER);
        UserModel model = new UserModel();
        model.setNome(dto.getNome());
        model.setEmail(dto.getEmail());
        model.setTipo(dto.getTipo());
        model.setSenha(passwordEncoder.encode(dto.getSenha()));
        return userRepository.save(model);
    }

    // admin edita; senha em branco mantém a atual. O admin logado não pode tirar o próprio perfil ADMIN.
    @Transactional
    public UserModel updateFromDto(Long id, UserDTO dto, String emailLogado) {
        Optional<UserModel> existente = find(id);
        if (existente.isEmpty()) return null;
        UserModel model = existente.get();

        if (dto.getSenha() != null && dto.getSenha().isBlank()) dto.setSenha(null);
        validar(dto, id, false);
        if (model.getEmail().equals(emailLogado) && dto.getTipo() != null && dto.getTipo() != TipoUsuario.ADMIN) {
            throw new RegraNegocioException("Você não pode tirar o seu próprio perfil de administrador.");
        }

        if (dto.getNome() != null) model.setNome(dto.getNome());
        if (dto.getEmail() != null) model.setEmail(dto.getEmail());
        if (dto.getTipo() != null) model.setTipo(dto.getTipo());
        if (dto.getSenha() != null) model.setSenha(passwordEncoder.encode(dto.getSenha()));
        return userRepository.save(model);
    }

    // retorna null se o email já estiver cadastrado
    public UserModel register(RegisterDTO dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) return null;
        UserModel model = new UserModel();
        model.setNome(dto.nome());
        model.setEmail(dto.email());
        model.setSenha(passwordEncoder.encode(dto.password()));
        model.setTipo(dto.role() != null ? dto.role() : TipoUsuario.USER);
        return userRepository.save(model);
    }

    // usuário só volta se o email existir e a senha bater com o hash bcrypt
    public Optional<UserModel> login(String email, String password) {
        return userRepository.findByEmail(email)
            .filter(user -> passwordEncoder.matches(password, user.getSenha()));
    }

    // não exclui a si mesmo nem quem tem ofertas ou imóveis (histórico); favoritos saem junto
    @Transactional
    public void excluir(Long id, String emailLogado) {
        UserModel usuario = find(id)
            .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        if (usuario.getEmail().equals(emailLogado)) {
            throw new RegraNegocioException("Você não pode excluir o próprio usuário.");
        }
        if (ofertaRepository.existsByUsuarioId(id)) {
            throw new RegraNegocioException("Este usuário tem ofertas registradas e não pode ser excluído.");
        }
        if (imovelRepository.existsByUsuarioId(id)) {
            throw new RegraNegocioException("Este usuário é responsável por imóveis e não pode ser excluído.");
        }
        favoritoRepository.deleteByUsuarioId(id);
        userRepository.deleteById(id);
    }

    // idAtual = null no cadastro; no cadastro a senha é obrigatória
    private void validar(UserDTO dto, Long idAtual, boolean senhaObrigatoria) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe o nome.");
        }
        if (dto.getEmail() == null || !dto.getEmail().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe um e-mail válido.");
        }
        dto.setEmail(dto.getEmail().trim().toLowerCase());
        if ((senhaObrigatoria || dto.getSenha() != null) && (dto.getSenha() == null || dto.getSenha().length() < 4)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "A senha precisa ter pelo menos 4 caracteres.");
        }
        Optional<UserModel> mesmoEmail = userRepository.findByEmail(dto.getEmail());
        if (mesmoEmail.isPresent() && !mesmoEmail.get().getId().equals(idAtual)) {
            throw new RegraNegocioException("Já existe um usuário com este e-mail.");
        }
    }

}
