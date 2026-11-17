import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NovaOferta, Oferta } from '../models/oferta';
import { Pagina } from '../models/pagina';

@Injectable({ providedIn: 'root' })
export class OfertaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/ofertas`;

  criar(oferta: NovaOferta): Observable<Oferta> {
    return this.http.post<Oferta>(this.url, oferta);
  }

  minhas(): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.url}/minhas`);
  }

  cancelar(id: number): Observable<Oferta> {
    return this.http.patch<Oferta>(`${this.url}/${id}/cancelar`, {});
  }

  // ---- admin ----

  // status vazio = todas; mais recentes primeiro
  todas(status: string, page: number, size: number): Observable<Pagina<Oferta>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'dataCriacao,desc');
    if (status) params = params.set('status', status);
    return this.http.get<Pagina<Oferta>>(this.url, { params });
  }

  aceitar(id: number): Observable<Oferta> {
    return this.http.patch<Oferta>(`${this.url}/${id}/aceitar`, {});
  }

  recusar(id: number): Observable<Oferta> {
    return this.http.patch<Oferta>(`${this.url}/${id}/recusar`, {});
  }
}
