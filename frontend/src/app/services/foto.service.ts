import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FotoImovel } from '../models/imovel';

// escrita das fotos (admin). Listar e montar a URL da imagem ficam no ImovelService.
@Injectable({ providedIn: 'root' })
export class FotoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/fotos-imoveis`;

  enviar(imovelId: number, arquivo: File): Observable<FotoImovel> {
    const form = new FormData();
    form.append('file', arquivo);
    form.append('imovelId', String(imovelId));
    return this.http.post<FotoImovel>(`${this.url}/upload`, form);
  }

  atualizar(id: number, dados: { capa?: boolean; ordem?: number }): Observable<FotoImovel> {
    return this.http.put<FotoImovel>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
