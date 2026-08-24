import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Lista } from './lista/lista';
import { Contato } from './contato/contato';
import { Admin } from './features/admin/admin';
import { authGuard } from './services/auth-guard';
import { Perfil } from './perfil/perfil';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin', component: Admin, canActivate: [authGuard]},
  { path: 'lista', component: Lista, canActivate: [authGuard] },
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: 'contato', component: Contato },
];