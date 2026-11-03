import { Routes } from '@angular/router';
import { ImoveisLista } from './pages/imoveis-lista/imoveis-lista';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { AcessoNegado } from './pages/acesso-negado/acesso-negado';
import { NaoEncontrado } from './pages/nao-encontrado/nao-encontrado';

export const routes: Routes = [
  // públicas
  { path: '', component: ImoveisLista },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'acesso-negado', component: AcessoNegado },

  { path: '**', component: NaoEncontrado }
];
