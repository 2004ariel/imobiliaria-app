import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NovaOferta, Oferta } from '../models/oferta';

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
}
