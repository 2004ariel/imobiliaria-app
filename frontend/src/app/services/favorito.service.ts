import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Imovel } from '../models/imovel';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/favoritos`;

  // ids dos imóveis favoritos do cliente logado; os corações leem daqui
  ids = signal<Set<number>>(new Set());

  // GET /favoritos devolve os imóveis; aproveita para atualizar os ids
  listar(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(this.url).pipe(
      tap((imoveis) => this.ids.set(new Set(imoveis.map((i) => i.id))))
    );
  }

  // usado pela vitrine e pelo detalhe para os corações começarem certos
  carregarIds(): void {
    this.listar().subscribe({ error: () => this.ids.set(new Set()) });
  }

  ehFavorito(imovelId: number): boolean {
    return this.ids().has(imovelId);
  }

  adicionar(imovelId: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${imovelId}`, {}).pipe(
      tap(() => this.ids.update((ids) => new Set(ids).add(imovelId)))
    );
  }

  remover(imovelId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${imovelId}`).pipe(
      tap(() => this.ids.update((ids) => {
        const novo = new Set(ids);
        novo.delete(imovelId);
        return novo;
      }))
    );
  }

  // ao sair, o próximo usuário não herda os corações
  limpar(): void {
    this.ids.set(new Set());
  }
}
