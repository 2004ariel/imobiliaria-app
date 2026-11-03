import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErroApi } from '../../models/erro-api';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html'
})
export class Cadastro {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] })
  });

  enviando = signal(false);
  erro = signal('');

  cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set('');

    const { nome, email, senha } = this.form.getRawValue();
    this.auth.register(nome, email, senha).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { cadastro: 'ok' } }),
      error: (e: ErroApi) => {
        this.erro.set(e.mensagem); // 409: "E-mail já cadastrado" vem do backend
        this.enviando.set(false);
      }
    });
  }
}
