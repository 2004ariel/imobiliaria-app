import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OfertaService } from '../../services/oferta.service';
import { Oferta } from '../../models/oferta';
import { ErroApi } from '../../models/erro-api';
import { classeStatusOferta, rotuloStatusOferta, rotuloTipoOferta } from '../../models/rotulos';

@Component({
  selector: 'app-cliente-ofertas',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './cliente-ofertas.html'
})
export class ClienteOfertas implements OnInit {
  private ofertaService = inject(OfertaService);
  private route = inject(ActivatedRoute);

  ofertas = signal<Oferta[]>([]);
  carregando = signal(true);
  erro = signal('');
  aviso = signal('');

  // cancelamento: qual oferta está pedindo confirmação, qual está sendo enviada e erro por oferta
  confirmandoId = signal<number | null>(null);
  cancelandoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  rotuloStatus = rotuloStatusOferta;
  classeStatus = classeStatusOferta;
  rotuloTipo = rotuloTipoOferta;

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('enviada')) {
      this.aviso.set('Oferta enviada! Acompanhe a situação por aqui.');
    }
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.ofertaService.minhas().subscribe({
      next: (lista) => {
        this.ofertas.set(lista);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar suas ofertas. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  pedirConfirmacao(id: number): void {
    this.erroAcao.set(null);
    this.confirmandoId.set(id);
  }

  cancelar(id: number): void {
    this.cancelandoId.set(id);
    this.erroAcao.set(null);
    this.ofertaService.cancelar(id).subscribe({
      next: (atualizada) => {
        // troca só o status na lista (a resposta já vem com o novo status)
        this.ofertas.update((lista) => lista.map((o) => (o.id === id ? { ...o, status: atualizada.status } : o)));
        this.confirmandoId.set(null);
        this.cancelandoId.set(null);
        this.aviso.set('Oferta cancelada.');
      },
      error: (e: ErroApi) => {
        this.erroAcao.set({ id, mensagem: e.mensagem });
        this.cancelandoId.set(null);
      }
    });
  }
}
