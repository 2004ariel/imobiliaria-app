import { Routes } from '@angular/router';
import { ImoveisLista } from './pages/imoveis-lista/imoveis-lista';
import { ImovelDetalhe } from './pages/imovel-detalhe/imovel-detalhe';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { AcessoNegado } from './pages/acesso-negado/acesso-negado';
import { NaoEncontrado } from './pages/nao-encontrado/nao-encontrado';
import { ClienteInicio } from './pages/cliente-inicio/cliente-inicio';
import { AdminInicio } from './pages/admin-inicio/admin-inicio';
import { authGuard, roleGuard } from './guards/auth.guard';
import { ROLES_CLIENTE } from './services/auth.service';

export const routes: Routes = [
  // públicas
  { path: '', component: ImoveisLista },
  { path: 'imoveis/:id', component: ImovelDetalhe },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'acesso-negado', component: AcessoNegado },

  // protegidas: precisa estar logado e ter a role da rota
  { path: 'cliente', component: ClienteInicio, canActivate: [authGuard, roleGuard], data: { roles: ROLES_CLIENTE } },
  { path: 'admin', component: AdminInicio, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },

  { path: '**', component: NaoEncontrado }
];
