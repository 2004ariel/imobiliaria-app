import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Imovel } from '../models/imovel';

@Injectable({ providedIn: 'root' })
export class ImovelService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/imoveis`;

  getAll(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(this.url);
  }
}
