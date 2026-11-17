import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImovelService } from '../../services/imovel.service';
import { FotoImovel, Imovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';
import { classeStatus, rotuloStatus, ehAluguel, precoPrincipal } from '../../utils/imovel-util';

@Component({
  selector: 'app-imovel-detalhe',
  imports: [CurrencyPipe, DecimalPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './imovel-detalhe.html',
  styleUrl: './imovel-detalhe.scss'
})
export class ImovelDetalhe implements OnInit {
  private imovelService = inject(ImovelService);
  private route = inject(ActivatedRoute);

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

  ehAluguel = ehAluguel;
  precoPrincipal = precoPrincipal;
  classeStatus = classeStatus;
  rotuloStatus = rotuloStatus;

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
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 404 ? 'Imóvel não encontrado.' : 'Não foi possível carregar o imóvel. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });

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
}
