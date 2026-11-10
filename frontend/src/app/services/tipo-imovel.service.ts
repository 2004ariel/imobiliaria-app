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
}
