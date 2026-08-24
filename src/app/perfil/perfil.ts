import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Perfil {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  sair() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}