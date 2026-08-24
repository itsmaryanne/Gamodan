import { Injectable, computed, signal } from '@angular/core';

export type AuthMode = 'entrar' | 'criar';

export type AuthUser = {
  nome: string;
  email: string;
  admin?: boolean;
};

type AuthCredentials = {
  nome?: string;
  email: string;
  senha: string;
};

interface LoginPayload {
  nome: string;
  email: string;
  senha: string;
}

const STORAGE_KEY = 'gamodan-auth-user';
const LEGACY_LOGADO_KEY = 'logado';
const ADMIN_EMAIL = 'admin@gamodan.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly modalAbertoState = signal(false);
  private readonly modoState = signal<AuthMode>('entrar');
  private readonly usuarioState = signal<AuthUser | null>(this.carregarUsuario());

  readonly modalAberto = this.modalAbertoState.asReadonly();
  readonly modo = this.modoState.asReadonly();
  readonly autenticado = computed(() => this.usuarioState() !== null);
  readonly isLogado = this.autenticado;
  readonly admin = computed(() => this.usuarioState()?.admin ?? false);
  readonly usuario = this.usuarioState.asReadonly();

  abrirModal(modo: AuthMode = 'entrar'): void {
    this.modoState.set(modo);
    this.modalAbertoState.set(true);
  }

  fecharModal(): void {
    this.modalAbertoState.set(false);
  }

  login(credenciais: AuthCredentials | string, senha?: string): boolean {
    const dados = this.normalizarCredenciais(credenciais, senha);

    if (!dados) {
      return false;
    }

    const email = this.normalizarEmail(dados.email);
    const nome = dados.nome?.trim() || this.extrairNome(email) || (email === ADMIN_EMAIL ? 'Administrador' : 'Usuário');
    const usuario: AuthUser = {
      nome,
      email,
      admin: email === ADMIN_EMAIL,
    };

    this.usuarioState.set(usuario);
    this.salvarUsuario(usuario);
    this.fecharModal();
    return true;
  }

  register(dados: AuthCredentials): boolean {
    return this.login(dados);
  }

  logout(): void {
    this.usuarioState.set(null);
    this.removerUsuario();
    this.fecharModal();
  }

  getStorageKeyForUser(email: string): string {
    return `${STORAGE_KEY}:${email}`;
  }

  private normalizarCredenciais(credenciais: AuthCredentials | string, senha?: string): AuthCredentials | null {
    if (typeof credenciais === 'string') {
      if (!senha) {
        return null;
      }

      return {
        email: credenciais,
        senha,
      };
    }

    if (!credenciais.email || !credenciais.senha) {
      return null;
    }

    return credenciais;
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private extrairNome(email: string): string {
    const nome = email.split('@')[0]?.trim();
    return nome || 'Usuário';
  }

  private carregarUsuario(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const bruto = window.localStorage.getItem(STORAGE_KEY);

    if (bruto) {
      try {
        const usuario = JSON.parse(bruto) as Partial<AuthUser>;
        if (typeof usuario.nome === 'string' && typeof usuario.email === 'string') {
          return {
            nome: usuario.nome,
            email: usuario.email,
            admin: Boolean(usuario.admin),
          };
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (window.localStorage.getItem(LEGACY_LOGADO_KEY) === 'true') {
      return {
        nome: 'Usuário',
        email: '',
        admin: false,
      };
    }

    return null;
  }

  private salvarUsuario(usuario: AuthUser): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    window.localStorage.setItem(LEGACY_LOGADO_KEY, 'true');
  }

  private removerUsuario(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_LOGADO_KEY);
  }
}

export { AuthService as Auth };

export type LoginPayloadAlias = LoginPayload;
