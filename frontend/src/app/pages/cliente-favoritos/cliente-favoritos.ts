import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritoService } from '../../services/favorito.service';
import { Imovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';
import { ImovelCard } from '../../components/imovel-card/imovel-card';

@Component({
  selector: 'app-cliente-favoritos',
  imports: [RouterLink, ImovelCard],
  templateUrl: './cliente-favoritos.html',
  styleUrl: './cliente-favoritos.scss'
})
export class ClienteFavoritos implements OnInit {
  private favoritoService = inject(FavoritoService);

  private imoveis = signal<Imovel[]>([]);
  // some da tela assim que sai dos favoritos (pelo botão ou pelo coração do card)
  visiveis = computed(() => this.imoveis().filter((i) => this.favoritoService.ids().has(i.id)));

  carregando = signal(true);
  erro = signal('');
  removendoId = signal<number | null>(null);
  erroRemover = signal<{ id: number; mensagem: string } | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.favoritoService.listar().subscribe({
      next: (lista) => {
        this.imoveis.set(lista);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar seus favoritos. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  remover(id: number): void {
    this.removendoId.set(id);
    this.erroRemover.set(null);
    this.favoritoService.remover(id).subscribe({
      next: () => this.removendoId.set(null),
      error: () => {
        this.erroRemover.set({ id, mensagem: 'Não foi possível remover. Tente novamente.' });
        this.removendoId.set(null);
      }
    });
  }
}
