import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { ImovelService } from '../../services/imovel.service';
import { BairroService } from '../../services/bairro.service';
import { TipoImovelService } from '../../services/tipo-imovel.service';
import { Bairro, FiltrosImovel, Imovel, TipoImovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';
import { classeStatus, ehAluguel, precoPrincipal } from '../../utils/imovel-util';

const TAMANHO_PAGINA = 9;

@Component({
  selector: 'app-imoveis-lista',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './imoveis-lista.html',
  styleUrl: './imoveis-lista.scss'
})
export class ImoveisLista implements OnInit {
  private imovelService = inject(ImovelService);
  private bairroService = inject(BairroService);
  private tipoService = inject(TipoImovelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  imoveis = signal<Imovel[]>([]);
  carregando = signal(true);
  erro = signal('');

  // paginação (number do Spring começa em 0)
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);

  // selects de tipo e bairro
  bairros = signal<Bairro[]>([]);
  tipos = signal<TipoImovel[]>([]);
  erroSelects = signal('');

  filtros = new FormGroup({
    finalidade: new FormControl('', { nonNullable: true }),
    tipoId: new FormControl('', { nonNullable: true }),
    bairroId: new FormControl('', { nonNullable: true }),
    dormitorios: new FormControl('', { nonNullable: true }),
    precoMin: new FormControl('', { nonNullable: true }),
    precoMax: new FormControl('', { nonNullable: true }),
    sort: new FormControl('', { nonNullable: true })
  });

  // funções usadas no template
  ehAluguel = ehAluguel;
  precoPrincipal = precoPrincipal;
  classeStatus = classeStatus;

  ngOnInit(): void {
    this.carregarSelects();

    // a query string é a fonte da verdade: mudou a URL (filtro, página ou botão voltar) -> busca de novo
    this.route.queryParamMap.subscribe((params) => {
      this.preencherFormulario(params);
      this.buscar(params);
    });
  }

  private carregarSelects(): void {
    this.bairroService.getAll().subscribe({
      next: (lista) => this.bairros.set(lista),
      error: () => this.erroSelects.set('Não foi possível carregar bairros e tipos para o filtro.')
    });
    this.tipoService.getAll().subscribe({
      next: (lista) => this.tipos.set(lista),
      error: () => this.erroSelects.set('Não foi possível carregar bairros e tipos para o filtro.')
    });
  }

  private preencherFormulario(params: ParamMap): void {
    this.filtros.setValue({
      finalidade: params.get('finalidade') ?? '',
      tipoId: params.get('tipoId') ?? '',
      bairroId: params.get('bairroId') ?? '',
      dormitorios: params.get('dormitorios') ?? '',
      precoMin: params.get('precoMin') ?? '',
      precoMax: params.get('precoMax') ?? '',
      sort: params.get('sort') ?? ''
    });
  }

  private buscar(params: ParamMap): void {
    const filtros: FiltrosImovel = {
      ...this.filtros.getRawValue(),
      page: Number(params.get('page') ?? 0),
      size: TAMANHO_PAGINA
    };

    this.carregando.set(true);
    this.erro.set('');

    this.imovelService.buscar(filtros).subscribe({
      next: (resposta) => {
        this.imoveis.set(resposta.content);
        this.pagina.set(resposta.number);
        this.totalPaginas.set(resposta.totalPages);
        this.totalElementos.set(resposta.totalElements);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar os imóveis. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  // botão "Filtrar" e select de ordenação: volta para a primeira página
  aplicarFiltros(): void {
    this.navegar({ ...this.filtros.getRawValue(), page: 0 });
  }

  limparFiltros(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  irParaPagina(pagina: number): void {
    this.navegar({ ...this.filtros.getRawValue(), page: pagina });
  }

  // coloca na URL só o que está preenchido (vazio vira null = some da URL)
  private navegar(valores: FiltrosImovel): void {
    const queryParams: Record<string, string | number | null> = {};
    for (const [chave, valor] of Object.entries(valores)) {
      const vazio = valor === '' || (chave === 'page' && valor === 0);
      queryParams[chave] = vazio ? null : (valor as string | number);
    }
    this.router.navigate([], { relativeTo: this.route, queryParams });
  }
}
