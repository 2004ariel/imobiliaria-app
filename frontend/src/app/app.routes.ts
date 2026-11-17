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
import { AdminOfertas } from './pages/admin-ofertas/admin-ofertas';
import { AdminContratos } from './pages/admin-contratos/admin-contratos';
import { AdminBairros } from './pages/admin-bairros/admin-bairros';
import { AdminTipos } from './pages/admin-tipos/admin-tipos';
import { AdminImoveis } from './pages/admin-imoveis/admin-imoveis';
import { AdminImovelForm } from './pages/admin-imovel-form/admin-imovel-form';
import { AdminFotos } from './pages/admin-fotos/admin-fotos';
import { AdminUsuarios } from './pages/admin-usuarios/admin-usuarios';
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
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      // carregado sob demanda: o Chart.js (pesado) só baixa para quem abre o painel
      { path: '', loadComponent: () => import('./pages/admin-inicio/admin-inicio').then((m) => m.AdminInicio) },
      { path: 'ofertas', component: AdminOfertas },
      { path: 'contratos', component: AdminContratos },
      { path: 'imoveis', component: AdminImoveis },
      { path: 'imoveis/novo', component: AdminImovelForm },
      { path: 'imoveis/:id/editar', component: AdminImovelForm },
      { path: 'fotos', component: AdminFotos },
      { path: 'bairros', component: AdminBairros },
      { path: 'tipos', component: AdminTipos },
      { path: 'usuarios', component: AdminUsuarios }
    ]
  },

  { path: '**', component: NaoEncontrado }
];
