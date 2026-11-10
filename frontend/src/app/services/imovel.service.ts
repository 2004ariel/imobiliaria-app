import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FiltrosImovel, FotoImovel, Imovel, SaberMais } from '../models/imovel';
import { Pagina } from '../models/pagina';

@Injectable({ providedIn: 'root' })
export class ImovelService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/imoveis`;
  private urlFotos = `${environment.apiUrl}/fotos-imoveis`;

  // vitrine: só manda os filtros preenchidos
  buscar(filtros: FiltrosImovel): Observable<Pagina<Imovel>> {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, valor);
      }
    }
    return this.http.get<Pagina<Imovel>>(this.url, { params });
  }

  find(id: number): Observable<Imovel> {
    return this.http.get<Imovel>(`${this.url}/${id}`);
  }

  getFotos(imovelId: number): Observable<FotoImovel[]> {
    return this.http.get<FotoImovel[]>(`${this.urlFotos}/imovel/${imovelId}`);
  }

  urlFoto(foto: FotoImovel): string {
    return this.urlArquivo(foto.nomeArquivo);
  }

  urlArquivo(nomeArquivo: string): string {
    return `${this.urlFotos}/arquivo/${encodeURIComponent(nomeArquivo)}`;
  }

  // o backend responde texto ("Enviado"), não JSON
  saberMais(dados: SaberMais): Observable<string> {
    return this.http.post(`${this.url}/sabermais/${dados.imovelId}`, dados, { responseType: 'text' });
  }
}
