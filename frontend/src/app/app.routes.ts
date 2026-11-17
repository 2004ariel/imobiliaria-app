import { Routes } from '@angular/router';
import { ImoveisLista } from './pages/imoveis-lista/imoveis-lista';
import { ImovelDetalhe } from './pages/imovel-detalhe/imovel-detalhe';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { AcessoNegado } from './pages/acesso-negado/acesso-negado';
import { NaoEncontrado } from './pages/nao-encontrado/nao-encontrado';
import { ClienteOfertas } from './pages/cliente-ofertas/cliente-ofertas';
import { ClienteFavoritos } from './pages/cliente-favoritos/cliente-favoritos';
import { ClienteContratos } from './pages/cliente-contratos/cliente-contratos';
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
  // os guards do pai valem para todas as telas filhas
  {
    path: 'cliente',
    canActivate: [authGuard, roleGuard],
    data: { roles: ROLES_CLIENTE },
    children: [
      { path: '', redirectTo: 'ofertas', pathMatch: 'full' },
      { path: 'ofertas', component: ClienteOfertas },
      { path: 'favoritos', component: ClienteFavoritos },
      { path: 'contratos', component: ClienteContratos }
    ]
  },
  { path: 'admin', component: AdminInicio, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },

  { path: '**', component: NaoEncontrado }
];
