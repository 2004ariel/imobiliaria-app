import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImovelService } from '../../services/imovel.service';
import { FotoImovel, Imovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';
import { AuthService } from '../../services/auth.service';
import { FavoritoService } from '../../services/favorito.service';
import { OfertaService } from '../../services/oferta.service';
import { TipoOferta } from '../../models/oferta';
import { classeStatusImovel, rotuloStatusImovel, rotuloTipoOferta } from '../../models/rotulos';
import { ehAluguel, precoPrincipal } from '../../utils/imovel-util';

@Component({
  selector: 'app-imovel-detalhe',
  imports: [CurrencyPipe, DecimalPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './imovel-detalhe.html',
  styleUrl: './imovel-detalhe.scss'
})
export class ImovelDetalhe implements OnInit {
  private imovelService = inject(ImovelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ofertaService = inject(OfertaService);
  auth = inject(AuthService);
  favoritos = inject(FavoritoService);

  imovel = signal<Imovel | null>(null);
  carregando = signal(true);
  erro = signal('');

  // fotos carregam à parte: se falharem, o resto da página continua
  fotos = signal<FotoImovel[]>([]);
  fotoAtual = signal<FotoImovel | null>(null);
  erroFotos = signal(false);

  // formulário de contato (POST /imoveis/sabermais/{id})
  contato = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    telefone: new FormControl('', { nonNullable: true }),
    mensagem: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });
  enviando = signal(false);
  sucessoEnvio = signal('');
  erroEnvio = signal('');

  // fazer oferta (só cliente logado em imóvel DISPONIVEL)
  oferta = new FormGroup({
    tipo: new FormControl<TipoOferta>('VENDA', { nonNullable: true, validators: [Validators.required] }),
    valorProposto: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    mensagem: new FormControl('', { nonNullable: true })
  });
  mostrarOferta = signal(false);
  enviandoOferta = signal(false);
  erroOferta = signal('');

  // favorito (coração)
  salvandoFavorito = signal(false);
  erroFavorito = signal('');

  ehAluguel = ehAluguel;
  precoPrincipal = precoPrincipal;
  classeStatus = classeStatusImovel;
  rotuloStatus = rotuloStatusImovel;
  rotuloTipo = rotuloTipoOferta;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.erro.set('Imóvel não encontrado.');
      this.carregando.set(false);
      return;
    }

    this.imovelService.find(id).subscribe({
      next: (imovel) => {
        this.imovel.set(imovel);
        this.contato.controls.mensagem.setValue(this.mensagemPadrao(imovel));
        const tipos = this.tiposDeOferta(imovel);
        if (tipos.length > 0) {
          this.oferta.controls.tipo.setValue(tipos[0]);
        }
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 404 ? 'Imóvel não encontrado.' : 'Não foi possível carregar o imóvel. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });

    if (this.auth.ehCliente()) {
      this.favoritos.carregarIds();
    }

    this.imovelService.getFotos(id).subscribe({
      next: (fotos) => {
        this.fotos.set(fotos);
        this.fotoAtual.set(fotos.find((f) => f.capa) ?? fotos[0] ?? null);
      },
      error: () => this.erroFotos.set(true)
    });
  }

  urlFoto(foto: FotoImovel): string {
    return this.imovelService.urlFoto(foto);
  }

  // mensagem já preenchida com código, tipo, bairro e valor (pedido do enunciado)
  private mensagemPadrao(imovel: Imovel): string {
    const preco = precoPrincipal(imovel);
    const valor = preco != null
      ? preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + (ehAluguel(imovel) ? '/mês' : '')
      : 'sob consulta';
    return `Olá! Tenho interesse no imóvel código ${imovel.id}`
      + ` (${imovel.tipoImovel?.nome ?? 'imóvel'}, bairro ${imovel.bairro?.nome ?? 'não informado'}, valor ${valor}).`
      + ' Gostaria de mais informações.';
  }

  enviarContato(): void {
    const imovel = this.imovel();
    if (!imovel) return;
    if (this.contato.invalid) {
      this.contato.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.sucessoEnvio.set('');
    this.erroEnvio.set('');

    this.imovelService.saberMais({ imovelId: imovel.id, ...this.contato.getRawValue() }).subscribe({
      next: () => {
        this.sucessoEnvio.set('Mensagem enviada! Em breve um corretor vai entrar em contato.');
        this.enviando.set(false);
      },
      error: () => {
        this.erroEnvio.set('Não foi possível enviar. Tente novamente.');
        this.enviando.set(false);
      }
    });
  }

  // só os tipos que têm preço no imóvel
  tiposDeOferta(imovel: Imovel): TipoOferta[] {
    const tipos: TipoOferta[] = [];
    if (imovel.precoVenda && imovel.precoVenda > 0) tipos.push('VENDA');
    if (imovel.precoAluguel && imovel.precoAluguel > 0) tipos.push('ALUGUEL');
    return tipos;
  }

  enviarOferta(): void {
    const imovel = this.imovel();
    if (!imovel) return;
    if (this.oferta.invalid) {
      this.oferta.markAllAsTouched();
      return;
    }

    this.enviandoOferta.set(true);
    this.erroOferta.set('');

    const { tipo, valorProposto, mensagem } = this.oferta.getRawValue();
    this.ofertaService.criar({ imovelId: imovel.id, tipo, valorProposto: Number(valorProposto), mensagem }).subscribe({
      next: () => this.router.navigate(['/cliente/ofertas'], { queryParams: { enviada: 1 } }),
      error: (e: ErroApi) => {
        // 409 traz a regra de negócio do backend (ex.: oferta pendente repetida)
        this.erroOferta.set(e.mensagem);
        this.enviandoOferta.set(false);
      }
    });
  }

  alternarFavorito(imovelId: number): void {
    const acao = this.favoritos.ehFavorito(imovelId)
      ? this.favoritos.remover(imovelId)
      : this.favoritos.adicionar(imovelId);

    this.salvandoFavorito.set(true);
    this.erroFavorito.set('');
    acao.subscribe({
      next: () => this.salvandoFavorito.set(false),
      error: () => {
        this.erroFavorito.set('Não foi possível atualizar os favoritos.');
        this.salvandoFavorito.set(false);
      }
    });
  }
}
