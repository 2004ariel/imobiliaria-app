import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BairroService } from '../../services/bairro.service';
import { Bairro } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';

const CEP = /^\d{5}-?\d{3}$/;

@Component({
  selector: 'app-admin-bairros',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-bairros.html'
})
export class AdminBairros implements OnInit {
  private bairroService = inject(BairroService);

  bairros = signal<Bairro[]>([]);
  carregando = signal(true);
  erro = signal('');
  aviso = signal('');

  // formulário: editandoId null = cadastro novo
  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cidade: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)] }),
    cepInicial: new FormControl('', { nonNullable: true, validators: [Validators.pattern(CEP)] }),
    cepFinal: new FormControl('', { nonNullable: true, validators: [Validators.pattern(CEP)] })
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
    this.bairroService.getAll().subscribe({
      next: (lista) => {
        this.bairros.set([...lista].sort((a, b) => a.nome.localeCompare(b.nome)));
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar os bairros. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  editar(bairro: Bairro): void {
    this.editandoId.set(bairro.id);
    this.erroForm.set('');
    this.form.setValue({
      nome: bairro.nome ?? '',
      cidade: bairro.cidade ?? '',
      estado: bairro.estado ?? '',
      cepInicial: bairro.cepInicial ?? '',
      cepFinal: bairro.cepFinal ?? ''
    });
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
    const v = this.form.getRawValue();
    const dados = { ...v, estado: v.estado.toUpperCase(), cepInicial: v.cepInicial || null, cepFinal: v.cepFinal || null };
    const id = this.editandoId();
    const chamada = id ? this.bairroService.atualizar(id, dados) : this.bairroService.criar(dados);

    this.salvando.set(true);
    this.erroForm.set('');
    chamada.subscribe({
      next: () => {
        this.aviso.set(id ? `Bairro "${dados.nome}" atualizado.` : `Bairro "${dados.nome}" cadastrado.`);
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

  excluir(bairro: Bairro): void {
    this.excluindoId.set(bairro.id);
    this.erroAcao.set(null);
    this.bairroService.excluir(bairro.id).subscribe({
      next: () => {
        this.aviso.set(`Bairro "${bairro.nome}" excluído.`);
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
        if (this.editandoId() === bairro.id) this.cancelarEdicao();
        this.carregar();
      },
      error: (e: ErroApi) => {
        // 409: bairro com imóveis (mensagem do backend)
        this.erroAcao.set({ id: bairro.id, mensagem: e.mensagem });
        this.excluindoId.set(null);
        this.confirmandoId.set(null);
      }
    });
  }
}
