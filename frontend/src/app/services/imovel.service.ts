import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FiltrosImovel, FotoImovel, Imovel, ImovelForm, SaberMais } from '../models/imovel';
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

  // ---- admin ----

  // lista do admin: filtro por status, mais novos primeiro
  listarAdmin(status: string, page: number, size: number): Observable<Pagina<Imovel>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'id,desc');
    if (status) params = params.set('status', status);
    return this.http.get<Pagina<Imovel>>(this.url, { params });
  }

  // todos (para o select da tela de fotos), em ordem de título
  listarTodos(): Observable<Pagina<Imovel>> {
    const params = new HttpParams().set('size', 500).set('sort', 'titulo,asc');
    return this.http.get<Pagina<Imovel>>(this.url, { params });
  }

  criar(imovel: ImovelForm): Observable<void> {
    return this.http.post<void>(this.url, imovel);
  }

  atualizar(id: number, imovel: ImovelForm): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, imovel);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
