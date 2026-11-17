import { Component, inject, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Imovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';
import { AuthService } from '../../services/auth.service';
import { FavoritoService } from '../../services/favorito.service';
import { ImovelService } from '../../services/imovel.service';
import { classeStatusImovel, rotuloStatusImovel } from '../../models/rotulos';
import { ehAluguel, precoPrincipal } from '../../utils/imovel-util';

// card de imóvel usado na vitrine e nos favoritos
@Component({
  selector: 'app-imovel-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './imovel-card.html',
  styleUrl: './imovel-card.scss'
})
export class ImovelCard {
  imovel = input.required<Imovel>();

  auth = inject(AuthService);
  favoritos = inject(FavoritoService);
  private imovelService = inject(ImovelService);

  salvando = signal(false);
  erroFavorito = signal('');

  ehAluguel = ehAluguel;
  precoPrincipal = precoPrincipal;
  classeStatus = classeStatusImovel;
  rotuloStatus = rotuloStatusImovel;

  urlCapa(nomeArquivo: string): string {
    return this.imovelService.urlArquivo(nomeArquivo);
  }

  alternarFavorito(): void {
    const id = this.imovel().id;
    const acao = this.favoritos.ehFavorito(id) ? this.favoritos.remover(id) : this.favoritos.adicionar(id);

    this.salvando.set(true);
    this.erroFavorito.set('');
    acao.subscribe({
      next: () => this.salvando.set(false),
      error: (e: ErroApi) => {
        this.erroFavorito.set(e.status === 0 ? e.mensagem : 'Não foi possível atualizar os favoritos.');
        this.salvando.set(false);
      }
    });
  }
}
