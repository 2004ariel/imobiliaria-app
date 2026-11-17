import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioForm } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/users`;

  // busca por nome ou e-mail (vazio = todos)
  getAll(busca = ''): Observable<Usuario[]> {
    const params = busca ? new HttpParams().set('busca', busca) : undefined;
    return this.http.get<Usuario[]>(this.url, { params });
  }

  criar(usuario: UsuarioForm): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, usuario);
  }

  atualizar(id: number, usuario: UsuarioForm): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, usuario);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
