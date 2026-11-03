import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrado',
  imports: [RouterLink],
  template: `
    <div class="pagina-aviso">
      <h2>Página não encontrada</h2>
      <p>O endereço digitado não existe.</p>
      <a routerLink="/" class="btn">Voltar para a vitrine</a>
    </div>
  `
})
export class NaoEncontrado {}
