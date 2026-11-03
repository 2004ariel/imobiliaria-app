import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cliente-inicio',
  template: `
    <h2>Área do cliente</h2>
    <p>Bem-vindo(a), <strong>{{ auth.usuario()?.email }}</strong>.</p>
    <p class="texto-suave">Em breve: suas ofertas e contratos.</p>
  `
})
export class ClienteInicio {
  auth = inject(AuthService);
}
