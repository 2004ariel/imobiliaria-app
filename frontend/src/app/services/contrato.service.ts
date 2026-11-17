import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contrato } from '../models/contrato';

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

  // o PDF exige token, então não dá para usar um <a href> direto:
  // baixa como blob pelo HttpClient (o interceptor põe o token) e a tela abre numa aba
  baixarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/pdf`, { responseType: 'blob' });
  }
}
