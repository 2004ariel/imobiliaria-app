import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContratoService } from '../../services/contrato.service';
import { Contrato } from '../../models/contrato';
import { ErroApi } from '../../models/erro-api';
import { classeStatusContrato, rotuloStatusContrato, rotuloTipoOferta } from '../../models/rotulos';

@Component({
  selector: 'app-cliente-contratos',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './cliente-contratos.html'
})
export class ClienteContratos implements OnInit {
  private contratoService = inject(ContratoService);

  contratos = signal<Contrato[]>([]);
  carregando = signal(true);
  erro = signal('');
  aviso = signal('');

  confirmandoId = signal<number | null>(null);
  assinandoId = signal<number | null>(null);
  baixandoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  rotuloStatus = rotuloStatusContrato;
  classeStatus = classeStatusContrato;
  rotuloTipo = rotuloTipoOferta;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.contratoService.meus().subscribe({
      next: (lista) => {
        this.contratos.set(lista);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar seus contratos. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  pedirConfirmacao(id: number): void {
    this.erroAcao.set(null);
    this.confirmandoId.set(id);
  }

  assinar(id: number): void {
    this.assinandoId.set(id);
    this.erroAcao.set(null);
    this.contratoService.assinar(id).subscribe({
      next: () => {
        this.confirmandoId.set(null);
        this.assinandoId.set(null);
        this.aviso.set('Contrato assinado com sucesso!');
        this.carregar();
      },
      error: (e: ErroApi) => {
        this.erroAcao.set({ id, mensagem: e.mensagem });
        this.assinandoId.set(null);
      }
    });
  }

  // abre a aba já no clique (senão o navegador bloqueia como pop-up) e põe o PDF nela quando chegar
  baixarPdf(id: number): void {
    const aba = window.open('', '_blank');
    this.baixandoId.set(id);
    this.erroAcao.set(null);

    this.contratoService.baixarPdf(id).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        if (aba) {
          aba.location.href = url;
        } else {
          window.location.href = url; // pop-up bloqueado: abre na mesma aba
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        this.baixandoId.set(null);
      },
      error: (e: ErroApi) => {
        aba?.close();
        this.erroAcao.set({ id, mensagem: e.status === 0 ? e.mensagem : 'Não foi possível abrir o PDF do contrato.' });
        this.baixandoId.set(null);
      }
    });
  }
}
