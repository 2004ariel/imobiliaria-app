import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { ErroApi } from '../../models/erro-api';

@Component({
  selector: 'app-admin-inicio',
  imports: [RouterLink],
  templateUrl: './admin-inicio.html'
})
export class AdminInicio implements OnInit {
  auth = inject(AuthService);
  private usuarioService = inject(UsuarioService);

  totalUsuarios = signal<number | null>(null);
  carregando = signal(true);
  erro = signal('');

  // primeira chamada autenticada (GET /users, só ADMIN): confirma que o token é aceito pelo backend
  ngOnInit(): void {
    this.usuarioService.getAll().subscribe({
      next: (lista) => {
        this.totalUsuarios.set(lista.length);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.mensagem);
        this.carregando.set(false);
      }
    });
  }
}
