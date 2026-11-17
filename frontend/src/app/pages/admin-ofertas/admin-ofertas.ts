import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OfertaService } from '../../services/oferta.service';
import { ContratoService } from '../../services/contrato.service';
import { Oferta } from '../../models/oferta';
import { ErroApi } from '../../models/erro-api';
import { OPCOES_STATUS_OFERTA, classeStatusOferta, rotuloStatusOferta, rotuloTipoOferta } from '../../models/rotulos';

const TAMANHO_PAGINA = 10;
const TAMANHO_MAX_PDF = 10 * 1024 * 1024; // mesmo limite do backend (10MB)

@Component({
  selector: 'app-admin-ofertas',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-ofertas.html'
})
export class AdminOfertas implements OnInit {
  private ofertaService = inject(OfertaService);
  private contratoService = inject(ContratoService);

  ofertas = signal<Oferta[]>([]);
  carregando = signal(true);
  erro = signal('');

  // filtro e paginação
  status = signal('');
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);

  // ações
  aviso = signal('');
  confirmando = signal<{ id: number; acao: 'aceitar' | 'recusar' } | null>(null);
  processandoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  // preparar contrato (formulário inline com o PDF)
  preparandoId = signal<number | null>(null);
  arquivo = signal<File | null>(null);
  erroArquivo = signal('');

  opcoesStatus = OPCOES_STATUS_OFERTA;
  rotuloStatus = rotuloStatusOferta;
  classeStatus = classeStatusOferta;
  rotuloTipo = rotuloTipoOferta;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.ofertaService.todas(this.status(), this.pagina(), TAMANHO_PAGINA).subscribe({
      next: (resposta) => {
        // a ação pode esvaziar a última página (ex.: filtro "Pendente"): volta uma
        if (resposta.content.length === 0 && resposta.number > 0) {
          this.pagina.set(resposta.number - 1);
          this.carregar();
          return;
        }
        this.ofertas.set(resposta.content);
        this.pagina.set(resposta.number);
        this.totalPaginas.set(resposta.totalPages);
        this.totalElementos.set(resposta.totalElements);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar as ofertas. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  filtrar(status: string): void {
    this.status.set(status);
    this.pagina.set(0);
    this.fecharAcoes();
    this.carregar();
  }

  irParaPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.fecharAcoes();
    this.carregar();
  }

  private fecharAcoes(): void {
    this.confirmando.set(null);
    this.preparandoId.set(null);
    this.erroAcao.set(null);
  }

  pedirConfirmacao(id: number, acao: 'aceitar' | 'recusar'): void {
    this.fecharAcoes();
    this.confirmando.set({ id, acao });
  }

  confirmar(oferta: Oferta): void {
    const acao = this.confirmando()?.acao;
    if (!acao) return;

    this.processandoId.set(oferta.id);
    this.erroAcao.set(null);
    const chamada = acao === 'aceitar' ? this.ofertaService.aceitar(oferta.id) : this.ofertaService.recusar(oferta.id);

    chamada.subscribe({
      next: () => {
        this.aviso.set(acao === 'aceitar'
          ? `Oferta #${oferta.id} aceita. O imóvel "${oferta.imovel.titulo}" ficou Reservado e as outras ofertas pendentes dele foram para "Em espera". Agora prepare o contrato.`
          : `Oferta #${oferta.id} recusada.`);
        this.processandoId.set(null);
        this.confirmando.set(null);
        this.carregar();
      },
      error: (e: ErroApi) => {
        // 409 traz a regra do backend (ex.: imóvel não está mais disponível)
        this.erroAcao.set({ id: oferta.id, mensagem: e.mensagem });
        this.processandoId.set(null);
      }
    });
  }

  abrirContrato(id: number): void {
    this.fecharAcoes();
    this.arquivo.set(null);
    this.erroArquivo.set('');
    this.preparandoId.set(id);
  }

  escolherArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.erroArquivo.set('');
    this.arquivo.set(null);

    if (!arquivo) return;
    const ehPdf = arquivo.name.toLowerCase().endsWith('.pdf') && (arquivo.type === 'application/pdf' || arquivo.type === '');
    if (!ehPdf) {
      this.erroArquivo.set('Escolha um arquivo .pdf.');
      input.value = '';
      return;
    }
    if (arquivo.size > TAMANHO_MAX_PDF) {
      this.erroArquivo.set('O PDF pode ter no máximo 10 MB.');
      input.value = '';
      return;
    }
    this.arquivo.set(arquivo);
  }

  enviarContrato(oferta: Oferta): void {
    const arquivo = this.arquivo();
    if (!arquivo) {
      this.erroArquivo.set('Escolha o PDF do contrato.');
      return;
    }

    this.processandoId.set(oferta.id);
    this.erroArquivo.set('');
    this.contratoService.criar(oferta.id, arquivo).subscribe({
      next: (contrato) => {
        this.aviso.set(`Contrato nº ${contrato.id} criado para a oferta #${oferta.id}. Aprove-o em Contratos para o cliente poder assinar.`);
        this.processandoId.set(null);
        this.preparandoId.set(null);
        this.carregar();
      },
      error: (e: ErroApi) => {
        // 400 = o backend não reconheceu o arquivo como PDF
        this.erroArquivo.set(e.status === 400 ? 'O arquivo não é um PDF válido.' : e.mensagem);
        this.processandoId.set(null);
      }
    });
  }
}
