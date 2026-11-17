import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { ErroApi } from '../../models/erro-api';
import { rotuloPerfil } from '../../models/rotulos';

@Component({
  selector: 'app-admin-usuarios',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-usuarios.html'
})
export class AdminUsuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  carregando = signal(true);
  erro = signal('');
  aviso = signal('');

  // [formGroup] no <form> da busca: sem ele o ngSubmit não dispara (o navegador faria um submit de verdade)
  buscaForm = new FormGroup({ busca: new FormControl('', { nonNullable: true }) });
  buscaAtual = signal('');

  // senha: obrigatória no cadastro, opcional na edição (vazia = mantém a atual)
  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] }),
    tipo: new FormControl('USER', { nonNullable: true, validators: [Validators.required] })
  });
  editando = signal<Usuario | null>(null);
  salvando = signal(false);
  erroForm = signal('');

  confirmandoId = signal<number | null>(null);
  excluindoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  rotuloPerfil = rotuloPerfil;

  ngOnInit(): void {
    this.carregar();
  }

  // o admin logado (não pode se excluir nem tirar o próprio perfil ADMIN)
  ehVoce(usuario: Usuario): boolean {
    return usuario.email === this.auth.usuario()?.email;
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.usuarioService.getAll(this.buscaAtual()).subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar os usuários. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  buscar(): void {
    this.buscaAtual.set(this.buscaForm.controls.busca.value.trim());
    this.confirmandoId.set(null);
    this.carregar();
  }

  limparBusca(): void {
    this.buscaForm.controls.busca.setValue('');
    this.buscar();
  }

  // perfis do select: USER e ADMIN; um registro antigo (COMPRADOR/VENDEDOR) mantém o seu como opção
  opcoesPerfil(): string[] {
    const atual = this.editando()?.tipo;
    return atual && atual !== 'USER' && atual !== 'ADMIN' ? [atual, 'USER', 'ADMIN'] : ['USER', 'ADMIN'];
  }

  editar(usuario: Usuario): void {
    this.editando.set(usuario);
    this.erroForm.set('');
    this.form.setValue({ nome: usuario.nome, email: usuario.email, senha: '', tipo: usuario.tipo });
    this.form.controls.senha.setValidators([Validators.minLength(4)]);
    this.form.controls.senha.updateValueAndValidity();
    // o próprio admin não troca o perfil (o backend também barra)
    if (this.ehVoce(usuario)) this.form.controls.tipo.disable();
    else this.form.controls.tipo.enable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao(): void {
    this.editando.set(null);
    this.erroForm.set('');
    this.form.reset();
    this.form.controls.tipo.enable();
    this.form.controls.senha.setValidators([Validators.required, Validators.minLength(4)]);
    this.form.controls.senha.updateValueAndValidity();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dados = { nome: v.nome.trim(), email: v.email.trim(), senha: v.senha || null, tipo: v.tipo };
    const atual = this.editando();
    const chamada: Observable<unknown> = atual ? this.usuarioService.atualizar(atual.id, dados) : this.usuarioService.criar(dados);

    this.salvando.set(true);
    this.erroForm.set('');
    chamada.subscribe({
      next: () => {
        this.aviso.set(atual ? `Usuário ${dados.email} atualizado.` : `Usuário ${dados.email} cadastrado.`);
        this.salvando.set(false);
        this.cancelarEdicao();
        this.carregar();
      },
      error: (e: ErroApi) => {
        // 409: e-mail repetido / próprio perfil; 400: validação (mensagens do backend)
        this.erroForm.set(e.mensagem);
        this.salvando.set(false);
      }
    });
  }

  pedirExclusao(id: number): void {
    this.erroAcao.set(null);
    this.confirmandoId.set(id);
  }

  excluir(usuario: Usuario): void {
    this.excluindoId.set(usuario.id);
    this.erroAcao.set(null);
    this.usuarioService.excluir(usuario.id).subscribe({
      next: () => {
        this.aviso.set(`Usuário ${usuario.email} excluído.`);
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
        if (this.editando()?.id === usuario.id) this.cancelarEdicao();
        this.carregar();
      },
      error: (e: ErroApi) => {
        // 409: usuário com ofertas/imóveis ou o próprio admin
        this.erroAcao.set({ id: usuario.id, mensagem: e.mensagem });
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
      }
    });
  }
}
