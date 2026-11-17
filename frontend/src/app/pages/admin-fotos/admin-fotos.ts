import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImovelService } from '../../services/imovel.service';
import { FotoService } from '../../services/foto.service';
import { FotoImovel, Imovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';

const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANHO_MAX = 10 * 1024 * 1024; // mesmo limite do backend

@Component({
  selector: 'app-admin-fotos',
  imports: [RouterLink],
  templateUrl: './admin-fotos.html',
  styleUrl: './admin-fotos.scss'
})
export class AdminFotos implements OnInit {
  private imovelService = inject(ImovelService);
  private fotoService = inject(FotoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // select de imóveis
  imoveis = signal<Imovel[]>([]);
  carregandoImoveis = signal(true);
  erroImoveis = signal('');
  imovelId = signal<number | null>(null);

  // fotos do imóvel escolhido
  fotos = signal<FotoImovel[]>([]);
  carregandoFotos = signal(false);
  erroFotos = signal('');
  aviso = signal('');

  // envio
  arquivo = signal<File | null>(null);
  erroArquivo = signal('');
  enviando = signal(false);

  // ações por foto
  processandoId = signal<number | null>(null);
  confirmandoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  ngOnInit(): void {
    this.imovelService.listarTodos().subscribe({
      next: (pagina) => {
        this.imoveis.set(pagina.content);
        this.carregandoImoveis.set(false);
      },
      error: (e: ErroApi) => {
        this.erroImoveis.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar os imóveis. Tente novamente mais tarde.');
        this.carregandoImoveis.set(false);
      }
    });

    // ?imovel=ID (vem do botão "Fotos" da lista de imóveis)
    this.route.queryParamMap.subscribe((params) => {
      const id = Number(params.get('imovel'));
      this.imovelId.set(id > 0 ? id : null);
      this.aviso.set('');
      this.limparEnvio();
      if (id > 0) this.carregarFotos();
      else this.fotos.set([]);
    });
  }

  escolherImovel(valor: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { imovel: valor || null } });
  }

  tituloEscolhido(): string {
    return this.imoveis().find((i) => i.id === this.imovelId())?.titulo ?? `Imóvel #${this.imovelId()}`;
  }

  carregarFotos(): void {
    const id = this.imovelId();
    if (!id) return;
    this.carregandoFotos.set(true);
    this.erroFotos.set('');
    this.confirmandoId.set(null);
    this.imovelService.getFotos(id).subscribe({
      next: (lista) => {
        this.fotos.set(lista);
        this.carregandoFotos.set(false);
      },
      error: (e: ErroApi) => {
        this.erroFotos.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar as fotos. Tente novamente.');
        this.carregandoFotos.set(false);
      }
    });
  }

  urlFoto(foto: FotoImovel): string {
    return this.imovelService.urlFoto(foto);
  }

  escolherArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.erroArquivo.set('');
    this.arquivo.set(null);
    if (!arquivo) return;

    if (!TIPOS_IMAGEM.includes(arquivo.type)) {
      this.erroArquivo.set('Escolha uma imagem JPG, PNG, WEBP ou GIF.');
      input.value = '';
      return;
    }
    if (arquivo.size > TAMANHO_MAX) {
      this.erroArquivo.set('A imagem pode ter no máximo 10 MB.');
      input.value = '';
      return;
    }
    this.arquivo.set(arquivo);
  }

  private limparEnvio(): void {
    this.arquivo.set(null);
    this.erroArquivo.set('');
    const input = document.getElementById('arquivoFoto') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  enviar(): void {
    const id = this.imovelId();
    const arquivo = this.arquivo();
    if (!id) return;
    if (!arquivo) {
      this.erroArquivo.set('Escolha a imagem.');
      return;
    }
    this.enviando.set(true);
    this.erroArquivo.set('');
    this.fotoService.enviar(id, arquivo).subscribe({
      next: (foto) => {
        this.aviso.set(foto.capa ? 'Foto enviada e definida como capa (é a primeira do imóvel).' : 'Foto enviada.');
        this.enviando.set(false);
        this.limparEnvio();
        this.carregarFotos();
      },
      error: (e: ErroApi) => {
        this.erroArquivo.set(e.mensagem);
        this.enviando.set(false);
      }
    });
  }

  marcarCapa(foto: FotoImovel): void {
    this.atualizar(foto, { capa: true }, 'Capa atualizada.');
  }

  salvarOrdem(foto: FotoImovel, valor: string): void {
    const ordem = Number(valor);
    if (!Number.isInteger(ordem) || ordem < 1) {
      this.erroAcao.set({ id: foto.id, mensagem: 'A ordem deve ser um número inteiro, 1 ou maior.' });
      return;
    }
    this.atualizar(foto, { ordem }, 'Ordem atualizada.');
  }

  private atualizar(foto: FotoImovel, dados: { capa?: boolean; ordem?: number }, mensagem: string): void {
    this.processandoId.set(foto.id);
    this.erroAcao.set(null);
    this.fotoService.atualizar(foto.id, dados).subscribe({
      next: () => {
        this.aviso.set(mensagem);
        this.processandoId.set(null);
        this.carregarFotos();
      },
      error: (e: ErroApi) => {
        this.erroAcao.set({ id: foto.id, mensagem: e.mensagem });
        this.processandoId.set(null);
      }
    });
  }

  pedirExclusao(id: number): void {
    this.erroAcao.set(null);
    this.confirmandoId.set(id);
  }

  excluir(foto: FotoImovel): void {
    this.processandoId.set(foto.id);
    this.erroAcao.set(null);
    this.fotoService.excluir(foto.id).subscribe({
      next: () => {
        this.aviso.set(foto.capa ? 'Foto excluída. A próxima foto virou a capa.' : 'Foto excluída.');
        this.processandoId.set(null);
        this.carregarFotos();
      },
      error: (e: ErroApi) => {
        this.erroAcao.set({ id: foto.id, mensagem: e.mensagem });
        this.processandoId.set(null);
        this.confirmandoId.set(null);
      }
    });
  }
}
