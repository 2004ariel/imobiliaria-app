import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Imovel } from '../models/imovel';
import { Pagina } from '../models/pagina';

@Injectable({ providedIn: 'root' })
export class ImovelService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/imoveis`;

  getAll(): Observable<Pagina<Imovel>> {
    return this.http.get<Pagina<Imovel>>(this.url);
  }
}
