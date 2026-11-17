import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContratoService } from '../../services/contrato.service';
import { Contrato } from '../../models/contrato';
import { ErroApi } from '../../models/erro-api';
import { OPCOES_STATUS_CONTRATO, classeStatusContrato, rotuloStatusContrato, rotuloTipoOferta } from '../../models/rotulos';

const TAMANHO_PAGINA = 10;

type Acao = 'aprovar' | 'cancelar';

@Component({
  selector: 'app-admin-contratos',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-contratos.html'
})
export class AdminContratos implements OnInit {
  private contratoService = inject(ContratoService);

  contratos = signal<Contrato[]>([]);
  carregando = signal(true);
  erro = signal('');

  status = signal('');
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);

  // aviso no topo: sucesso (verde) ou atenção (amarelo, e-mail que falhou)
  aviso = signal<{ tipo: 'sucesso' | 'atencao'; texto: string } | null>(null);
  confirmando = signal<{ id: number; acao: Acao } | null>(null);
  processandoId = signal<number | null>(null);
  baixandoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  opcoesStatus = OPCOES_STATUS_CONTRATO;
  rotuloStatus = rotuloStatusContrato;
  classeStatus = classeStatusContrato;
  rotuloTipo = rotuloTipoOferta;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.contratoService.todos(this.status(), this.pagina(), TAMANHO_PAGINA).subscribe({
      next: (resposta) => {
        if (resposta.content.length === 0 && resposta.number > 0) {
          this.pagina.set(resposta.number - 1);
          this.carregar();
          return;
        }
        this.contratos.set(resposta.content);
        this.pagina.set(resposta.number);
        this.totalPaginas.set(resposta.totalPages);
        this.totalElementos.set(resposta.totalElements);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar os contratos. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  filtrar(status: string): void {
    this.status.set(status);
    this.pagina.set(0);
    this.confirmando.set(null);
    this.carregar();
  }

  irParaPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.confirmando.set(null);
    this.carregar();
  }

  // regras de quais botões aparecem (o backend valida de novo)
  podeAprovar(c: Contrato): boolean {
    return c.status === 'AGUARDANDO_ASSINATURA' && !c.dataAprovacao;
  }

  podeCancelar(c: Contrato): boolean {
    return c.status === 'AGUARDANDO_ASSINATURA';
  }

  // antes da aprovação o cancelamento funciona como "recusar"
  rotuloCancelar(c: Contrato): string {
    return c.dataAprovacao ? 'Cancelar contrato' : 'Recusar';
  }

  pedirConfirmacao(id: number, acao: Acao): void {
    this.erroAcao.set(null);
    this.confirmando.set({ id, acao });
  }

  confirmar(contrato: Contrato): void {
    const acao = this.confirmando()?.acao;
    if (!acao) return;

    this.processandoId.set(contrato.id);
    this.erroAcao.set(null);
    const chamada = acao === 'aprovar' ? this.contratoService.aprovar(contrato.id) : this.contratoService.cancelar(contrato.id);

    chamada.subscribe({
      next: (resposta) => {
        if (acao === 'aprovar') {
          this.aviso.set(resposta.emailEnviado === false
            ? { tipo: 'atencao', texto: `Contrato nº ${contrato.id} aprovado, mas o e-mail não pôde ser enviado ao cliente. Avise-o por outro meio.` }
            : { tipo: 'sucesso', texto: `Contrato nº ${contrato.id} aprovado. O cliente foi avisado por e-mail e já pode assinar.` });
        } else {
          this.aviso.set({ tipo: 'sucesso', texto: `Contrato nº ${contrato.id} cancelado. O imóvel "${contrato.oferta.imovel.titulo}" voltou a Disponível e as ofertas em espera dele voltaram a Pendente.` });
        }
        this.processandoId.set(null);
        this.confirmando.set(null);
        this.carregar();
      },
      error: (e: ErroApi) => {
        this.erroAcao.set({ id: contrato.id, mensagem: e.mensagem });
        this.processandoId.set(null);
      }
    });
  }

  // mesma ideia da área do cliente: abre a aba no clique e põe o PDF quando chegar
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
          window.location.href = url;
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
