import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImovelService } from '../../services/imovel.service';
import { BairroService } from '../../services/bairro.service';
import { TipoImovelService } from '../../services/tipo-imovel.service';
import { Bairro, Imovel, ImovelForm, TipoImovel } from '../../models/imovel';
import { ErroApi } from '../../models/erro-api';
import { OPCOES_FINALIDADE, OPCOES_STATUS_IMOVEL } from '../../models/rotulos';

const INTEIRO = /^\d+$/;

// o preço da finalidade escolhida é obrigatório (VENDA → venda, ALUGUEL → aluguel)
function precoDaFinalidade(grupo: AbstractControl): ValidationErrors | null {
  const finalidade = grupo.get('finalidade')?.value;
  const campo = finalidade === 'ALUGUEL' ? 'precoAluguel' : 'precoVenda';
  const valor = grupo.get(campo)?.value;
  return valor === null || valor === '' || Number(valor) <= 0 ? { precoObrigatorio: campo } : null;
}

@Component({
  selector: 'app-admin-imovel-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-imovel-form.html'
})
export class AdminImovelForm implements OnInit {
  private imovelService = inject(ImovelService);
  private bairroService = inject(BairroService);
  private tipoService = inject(TipoImovelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  carregando = signal(true);
  erro = signal('');
  salvando = signal(false);
  erroForm = signal('');

  bairros = signal<Bairro[]>([]);
  tipos = signal<TipoImovel[]>([]);
  opcoesStatus = OPCOES_STATUS_IMOVEL;
  opcoesFinalidade = OPCOES_FINALIDADE;

  form = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    descricao: new FormControl('', { nonNullable: true }),
    finalidade: new FormControl('VENDA', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl('DISPONIVEL', { nonNullable: true, validators: [Validators.required] }),
    precoVenda: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    precoAluguel: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    dormitorios: new FormControl<number | null>(0, { validators: [Validators.min(0), Validators.pattern(INTEIRO)] }),
    banheiros: new FormControl<number | null>(0, { validators: [Validators.min(0), Validators.pattern(INTEIRO)] }),
    garagem: new FormControl<number | null>(0, { validators: [Validators.min(0), Validators.pattern(INTEIRO)] }),
    areaTotal: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    areaConstruida: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    endereco: new FormControl('', { nonNullable: true }),
    numero: new FormControl('', { nonNullable: true }),
    complemento: new FormControl('', { nonNullable: true }),
    cep: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^\d{5}-?\d{3}$/)] }),
    caracteristicas: new FormControl('', { nonNullable: true }),
    destaque: new FormControl(false, { nonNullable: true }),
    tipoId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bairroId: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  }, { validators: precoDaFinalidade });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = id ? Number(id) : null;

    this.bairroService.getAll().subscribe({
      next: (lista) => this.bairros.set([...lista].sort((a, b) => a.nome.localeCompare(b.nome))),
      error: () => this.erro.set('Não foi possível carregar os bairros. Tente novamente mais tarde.')
    });
    this.tipoService.getAll().subscribe({
      next: (lista) => this.tipos.set([...lista].sort((a, b) => a.nome.localeCompare(b.nome))),
      error: () => this.erro.set('Não foi possível carregar os tipos de imóvel. Tente novamente mais tarde.')
    });

    if (!this.id) {
      this.carregando.set(false);
      return;
    }
    this.imovelService.find(this.id).subscribe({
      next: (imovel) => {
        this.preencher(imovel);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 404 ? 'Imóvel não encontrado.' : 'Não foi possível carregar o imóvel. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  private preencher(i: Imovel): void {
    this.form.setValue({
      titulo: i.titulo ?? '',
      descricao: i.descricao ?? '',
      finalidade: (i.finalidade ?? 'VENDA').toUpperCase(),
      status: i.status ?? 'DISPONIVEL',
      precoVenda: i.precoVenda,
      precoAluguel: i.precoAluguel,
      dormitorios: i.dormitorios ?? 0,
      banheiros: i.banheiros ?? 0,
      garagem: i.garagem ?? 0,
      areaTotal: i.areaTotal,
      areaConstruida: i.areaConstruida,
      endereco: i.endereco ?? '',
      numero: i.numero ?? '',
      complemento: i.complemento ?? '',
      cep: i.cep ?? '',
      caracteristicas: i.caracteristicas ?? '',
      destaque: !!i.destaque,
      tipoId: i.tipoImovel ? String(i.tipoImovel.id) : '',
      bairroId: i.bairro ? String(i.bairro.id) : ''
    });
  }

  campoInvalido(nome: string): boolean {
    const c = this.form.get(nome);
    return !!c && c.touched && c.invalid;
  }

  // erro do preço obrigatório aparece no campo da finalidade escolhida
  precoFaltando(campo: 'precoVenda' | 'precoAluguel'): boolean {
    return this.form.hasError('precoObrigatorio') && this.form.getError('precoObrigatorio') === campo
      && (this.form.get(campo)?.touched ?? false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erroForm.set('Confira os campos destacados.');
      return;
    }
    const v = this.form.getRawValue();
    const numero = (x: number | null) => (x === null || (x as unknown) === '' ? null : Number(x));
    const dados: ImovelForm = {
      titulo: v.titulo.trim(),
      descricao: v.descricao,
      finalidade: v.finalidade,
      status: v.status,
      precoVenda: numero(v.precoVenda),
      precoAluguel: numero(v.precoAluguel),
      dormitorios: numero(v.dormitorios),
      banheiros: numero(v.banheiros),
      garagem: numero(v.garagem),
      areaTotal: numero(v.areaTotal),
      areaConstruida: numero(v.areaConstruida),
      endereco: v.endereco,
      numero: v.numero,
      complemento: v.complemento,
      cep: v.cep,
      caracteristicas: v.caracteristicas,
      destaque: v.destaque,
      tipoImovel: { id: Number(v.tipoId) },
      bairro: { id: Number(v.bairroId) }
    };

    this.salvando.set(true);
    this.erroForm.set('');
    const chamada = this.id ? this.imovelService.atualizar(this.id, dados) : this.imovelService.criar(dados);
    chamada.subscribe({
      next: () => this.router.navigate(['/admin/imoveis'], { queryParams: { salvo: this.id ? 'editado' : 'novo' } }),
      error: (e: ErroApi) => {
        // 400 traz a validação do backend em português
        this.erroForm.set(e.mensagem);
        this.salvando.set(false);
      }
    });
  }
}
