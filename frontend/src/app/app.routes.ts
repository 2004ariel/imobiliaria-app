import { Routes } from '@angular/router';
import { ImoveisLista } from './pages/imoveis-lista/imoveis-lista';

export const routes: Routes = [
  { path: '', component: ImoveisLista },
  { path: '**', redirectTo: '' }
];
