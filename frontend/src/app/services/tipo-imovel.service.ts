import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoImovel } from '../models/imovel';

@Injectable({ providedIn: 'root' })
export class TipoImovelService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/tiposimoveis`;

  getAll(): Observable<TipoImovel[]> {
    return this.http.get<TipoImovel[]>(this.url);
  }

  // ---- admin ----

  criar(tipo: Omit<TipoImovel, 'id'>): Observable<void> {
    return this.http.post<void>(this.url, tipo);
  }

  atualizar(id: number, tipo: Omit<TipoImovel, 'id'>): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, tipo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
