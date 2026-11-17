import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErroApi } from '../models/erro-api';

// 1) envia o token em toda requisição autenticada
// 2) traduz os erros da API em mensagens amigáveis (ErroApi)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const rotaPublica = req.url.includes('/public/');

  if (token && !rotaPublica) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let mensagem = 'Ocorreu um erro inesperado. Tente novamente.';

      if (err.status === 0) {
        mensagem = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
      } else if (err.status === 400) {
        // validação do nosso backend vem como {status, error} em português;
        // o 400 padrão do Spring (com "path") vem em inglês, então fica o texto genérico
        const corpo = err.error;
        mensagem = corpo?.error && !corpo?.path ? corpo.error : 'Dados inválidos. Confira os campos e tente novamente.';
      } else if (err.status === 401 && rotaPublica) {
        mensagem = 'E-mail ou senha inválidos.';
      } else if (err.status === 401) {
        mensagem = 'Sessão expirada. Faça login novamente.';
        auth.logout();
        router.navigate(['/login'], { queryParams: { sessao: 'expirada' } });
      } else if (err.status === 403) {
        mensagem = 'Acesso negado.';
      } else if (err.status === 404) {
        mensagem = 'Item não encontrado.';
      } else if (err.status === 409) {
        // mensagem da regra de negócio vinda do backend
        mensagem = err.error?.error ?? 'Conflito com dados já cadastrados.';
      }

      const erro: ErroApi = { status: err.status, mensagem };
      return throwError(() => erro);
    })
  );
};
