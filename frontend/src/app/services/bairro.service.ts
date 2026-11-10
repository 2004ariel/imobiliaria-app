import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bairro } from '../models/imovel';

@Injectable({ providedIn: 'root' })
export class BairroService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/bairros`;

  getAll(): Observable<Bairro[]> {
    return this.http.get<Bairro[]>(this.url);
  }
}
