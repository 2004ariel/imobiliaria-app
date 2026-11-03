import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ImovelService } from '../../services/imovel.service';
import { Imovel } from '../../models/imovel';

@Component({
  selector: 'app-imoveis-lista',
  imports: [CurrencyPipe],
  templateUrl: './imoveis-lista.html',
  styleUrl: './imoveis-lista.scss'
})
export class ImoveisLista implements OnInit {
  private imovelService = inject(ImovelService);

  imoveis = signal<Imovel[]>([]);
  carregando = signal(true);
  erro = signal('');

  ngOnInit(): void {
    this.imovelService.getAll().subscribe({
      next: (lista) => {
        this.imoveis.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os imóveis. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }
}
