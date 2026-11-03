import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acesso-negado',
  imports: [RouterLink],
  template: `
    <div class="pagina-aviso">
      <h2>Acesso negado</h2>
      <p>Seu perfil não tem permissão para acessar esta página.</p>
      <a routerLink="/" class="btn">Voltar para a vitrine</a>
    </div>
  `
})
export class AcessoNegado {}
