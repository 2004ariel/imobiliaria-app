import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImovelService } from '../../services/imovel.service';
import { Imovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';
import { OPCOES_STATUS_IMOVEL, classeStatusImovel, rotuloFinalidade, rotuloStatusImovel } from '../../models/rotulos';
import { ehAluguel, precoPrincipal } from '../../utils/imovel-util';

const TAMANHO_PAGINA = 10;

@Component({
  selector: 'app-admin-imoveis',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './admin-imoveis.html'
})
export class AdminImoveis implements OnInit {
  private imovelService = inject(ImovelService);
  private route = inject(ActivatedRoute);

  imoveis = signal<Imovel[]>([]);
  carregando = signal(true);
  erro = signal('');
  aviso = signal('');

  status = signal('');
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);

  confirmandoId = signal<number | null>(null);
  excluindoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  opcoesStatus = OPCOES_STATUS_IMOVEL;
  rotuloStatus = rotuloStatusImovel;
  classeStatus = classeStatusImovel;
  rotuloFinalidade = rotuloFinalidade;
  precoPrincipal = precoPrincipal;
  ehAluguel = ehAluguel;

  ngOnInit(): void {
    // aviso vindo do formulário (cadastrou/salvou)
    const salvo = this.route.snapshot.queryParamMap.get('salvo');
    if (salvo === 'novo') this.aviso.set('Imóvel cadastrado. Agora você pode enviar as fotos.');
    if (salvo === 'editado') this.aviso.set('Alterações salvas.');
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.imovelService.listarAdmin(this.status(), this.pagina(), TAMANHO_PAGINA).subscribe({
      next: (resposta) => {
        if (resposta.content.length === 0 && resposta.number > 0) {
          this.pagina.set(resposta.number - 1);
          this.carregar();
          return;
        }
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

  filtrar(status: string): void {
    this.status.set(status);
    this.pagina.set(0);
    this.confirmandoId.set(null);
    this.carregar();
  }

  irParaPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.confirmandoId.set(null);
    this.carregar();
  }

  pedirExclusao(id: number): void {
    this.erroAcao.set(null);
    this.confirmandoId.set(id);
  }

  excluir(imovel: Imovel): void {
    this.excluindoId.set(imovel.id);
    this.erroAcao.set(null);
    this.imovelService.excluir(imovel.id).subscribe({
      next: () => {
        this.aviso.set(`Imóvel "${imovel.titulo}" excluído (com as fotos).`);
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
        this.carregar();
      },
      error: (e: ErroApi) => {
        // 409: imóvel com ofertas/contrato (mensagem do backend)
        this.erroAcao.set({ id: imovel.id, mensagem: e.mensagem });
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
      }
    });
  }
}
