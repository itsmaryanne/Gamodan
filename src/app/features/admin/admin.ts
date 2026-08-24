import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  erro = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  entrar(): void {
    if (this.form.invalid) return;

    const { email, senha } = this.form.value;
    const sucesso = this.auth.login({
      email: email!,
      senha: senha!,
      nome: 'Administrador',
    });

    if (sucesso) {
      this.erro = false;
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.erro = true;
    }
  }
}