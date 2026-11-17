import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contrato } from '../models/contrato';
import { Pagina } from '../models/pagina';

@Injectable({ providedIn: 'root' })
export class ContratoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/contratos`;

  // só os aprovados (o backend filtra)
  meus(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.url}/meus`);
  }

  assinar(id: number): Observable<Contrato> {
    return this.http.patch<Contrato>(`${this.url}/${id}/assinar`, {});
  }

  // cliente e admin: o PDF exige token, então não dá para usar um <a href> direto:
  // baixa como blob pelo HttpClient (o interceptor põe o token) e a tela abre numa aba
  baixarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/pdf`, { responseType: 'blob' });
  }

  // ---- admin ----

  todos(status: string, page: number, size: number): Observable<Pagina<Contrato>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (status) params = params.set('status', status);
    return this.http.get<Pagina<Contrato>>(this.url, { params });
  }

  // multipart com o campo "file" (o navegador monta o Content-Type com o boundary)
  criar(ofertaId: number, pdf: File): Observable<Contrato> {
    const form = new FormData();
    form.append('file', pdf);
    return this.http.post<Contrato>(`${this.url}/oferta/${ofertaId}`, form);
  }

  aprovar(id: number): Observable<Contrato> {
    return this.http.patch<Contrato>(`${this.url}/${id}/aprovar`, {});
  }

  cancelar(id: number): Observable<Contrato> {
    return this.http.patch<Contrato>(`${this.url}/${id}/cancelar`, {});
  }
}
