import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErroApi } from '../../models/erro-api';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  enviando = signal(false);
  erro = signal('');
  aviso = signal('');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('sessao') === 'expirada') {
      this.aviso.set('Sessão expirada. Faça login novamente.');
    } else if (params.get('cadastro') === 'ok') {
      this.aviso.set('Cadastro realizado! Agora é só entrar.');
    }
  }

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set('');
    this.aviso.set('');

    const { email, senha } = this.form.getRawValue();
    this.auth.login(email, senha).subscribe({
      next: () => {
        // volta para a página que pediu o login (ex.: detalhe do imóvel); senão, área do perfil.
        // só aceita caminho interno ("/..."), nunca outro site
        const voltar = this.route.snapshot.queryParamMap.get('voltar');
        if (voltar && voltar.startsWith('/') && !voltar.startsWith('//')) {
          this.router.navigateByUrl(voltar);
        } else {
          this.router.navigate([this.auth.getRole() === 'ADMIN' ? '/admin' : '/cliente']);
        }
      },
      error: (e: ErroApi) => {
        this.erro.set(e.mensagem);
        this.enviando.set(false);
      }
    });
  }
}
