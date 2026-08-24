import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  abrirAutenticacao(modo: 'entrar' | 'criar' = 'entrar') {
    this.authService.abrirModal(modo);
  }

  sair() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}