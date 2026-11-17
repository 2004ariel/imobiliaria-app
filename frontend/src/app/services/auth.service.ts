import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioLogado } from '../models/usuario';

const CHAVE_TOKEN = 'token';

// perfis tratados como "cliente" (COMPRADOR/VENDEDOR são registros antigos)
export const ROLES_CLIENTE = ['USER', 'COMPRADOR', 'VENDEDOR'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/public`;

  // usuário logado (null = visitante); o menu e os guards leem daqui
  usuario = signal<UsuarioLogado | null>(this.lerUsuarioDoToken());

  login(email: string, senha: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.url}/login`, { email, password: senha }).pipe(
      tap((resposta) => {
        localStorage.setItem(CHAVE_TOKEN, resposta.token);
        this.usuario.set(this.lerUsuarioDoToken());
      })
    );
  }

  register(nome: string, email: string, senha: string): Observable<void> {
    return this.http.post<void>(`${this.url}/register`, { nome, email, password: senha });
  }

  logout(): void {
    localStorage.removeItem(CHAVE_TOKEN);
    this.usuario.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  getRole(): string | null {
    return this.usuario()?.role ?? null;
  }

  ehCliente(): boolean {
    return ROLES_CLIENTE.includes(this.getRole() ?? '');
  }

  // relê o token para considerar a expiração; token vencido = deslogado
  isLogado(): boolean {
    const usuario = this.lerUsuarioDoToken();
    if (!usuario && this.usuario()) {
      this.logout();
    }
    return usuario !== null;
  }

  // decodifica o payload do JWT (parte do meio, base64url) sem biblioteca
  private lerUsuarioDoToken(): UsuarioLogado | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      if (payload.exp * 1000 < Date.now()) return null;
      return { email: payload.sub, role: payload.role };
    } catch {
      return null;
    }
  }
}
