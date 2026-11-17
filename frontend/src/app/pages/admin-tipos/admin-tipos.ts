import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoImovelService } from '../../services/tipo-imovel.service';
import { TipoImovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';

@Component({
  selector: 'app-admin-tipos',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-tipos.html'
})
export class AdminTipos implements OnInit {
  private tipoService = inject(TipoImovelService);

  tipos = signal<TipoImovel[]>([]);
  carregando = signal(true);
  erro = signal('');
  aviso = signal('');

  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descricao: new FormControl('', { nonNullable: true })
  });
  editandoId = signal<number | null>(null);
  salvando = signal(false);
  erroForm = signal('');

  confirmandoId = signal<number | null>(null);
  excluindoId = signal<number | null>(null);
  erroAcao = signal<{ id: number; mensagem: string } | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.tipoService.getAll().subscribe({
      next: (lista) => {
        this.tipos.set([...lista].sort((a, b) => a.nome.localeCompare(b.nome)));
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar os tipos. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  editar(tipo: TipoImovel): void {
    this.editandoId.set(tipo.id);
    this.erroForm.set('');
    this.form.setValue({ nome: tipo.nome ?? '', descricao: tipo.descricao ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.erroForm.set('');
    this.form.reset();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dados = this.form.getRawValue();
    const id = this.editandoId();
    const chamada = id ? this.tipoService.atualizar(id, dados) : this.tipoService.criar(dados);

    this.salvando.set(true);
    this.erroForm.set('');
    chamada.subscribe({
      next: () => {
        this.aviso.set(id ? `Tipo "${dados.nome}" atualizado.` : `Tipo "${dados.nome}" cadastrado.`);
        this.salvando.set(false);
        this.cancelarEdicao();
        this.carregar();
      },
      error: (e: ErroApi) => {
        this.erroForm.set(e.mensagem);
        this.salvando.set(false);
      }
    });
  }

  pedirExclusao(id: number): void {
    this.erroAcao.set(null);
    this.confirmandoId.set(id);
  }

  excluir(tipo: TipoImovel): void {
    this.excluindoId.set(tipo.id);
    this.erroAcao.set(null);
    this.tipoService.excluir(tipo.id).subscribe({
      next: () => {
        this.aviso.set(`Tipo "${tipo.nome}" excluído.`);
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
        if (this.editandoId() === tipo.id) this.cancelarEdicao();
        this.carregar();
      },
      error: (e: ErroApi) => {
        // 409: tipo usado por imóveis (mensagem do backend)
        this.erroAcao.set({ id: tipo.id, mensagem: e.mensagem });
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
      }
    });
  }
}
