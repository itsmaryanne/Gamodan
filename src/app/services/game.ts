import { effect, Injectable, inject, signal } from '@angular/core';
import { Game } from '../models/game.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly _games = signal<Game[]>([]);
  private nextId = 1;
  private readonly authService = inject(AuthService);
  readonly games = this._games.asReadonly();

  constructor() {
    effect(
      () => {
        const usuario = this.authService.usuario();

        if (!usuario) {
          this._games.set([]);
          this.nextId = 1;
          return;
        }

        this.carregarPorUsuario(usuario.email);
      },
      { allowSignalWrites: true }
    );
  }

  addGame(game: Omit<Game, 'id'>) {
    const novo: Game = { ...game, id: this.nextId++ };
    this._games.update(lista => {
      const atualizado = [...lista, novo];
      this.salvarEstado(atualizado);
      return atualizado;
    });
  }

  toggleFavorito(id: number) {
    this._games.update(lista => {
      const atualizado = lista.map(g => g.id === id ? { ...g, favorito: !g.favorito } : g);
      this.salvarEstado(atualizado);
      return atualizado;
    });
  }

  setStatus(id: number, status: Game['status']) {
    this._games.update(lista => {
      const atualizado = lista.map(g => g.id === id ? { ...g, status } : g);
      this.salvarEstado(atualizado);
      return atualizado;
    });
  }

  private carregarPorUsuario(email: string) {
    if (typeof window === 'undefined') {
      this._games.set([]);
      this.nextId = 1;
      return;
    }

    const storageKey = this.authService.getStorageKeyForUser(email);
    const bruto = window.localStorage.getItem(storageKey);

    if (!bruto) {
      this._games.set([]);
      this.nextId = 1;
      return;
    }

    try {
      const estado = JSON.parse(bruto) as { nextId: number; games: Game[] };
      this._games.set(estado.games ?? []);
      this.nextId = estado.nextId ?? (estado.games?.length ?? 0) + 1;
    } catch {
      this._games.set([]);
      this.nextId = 1;
    }
  }

  private salvarEstado(games: Game[]) {
    const usuario = this.authService.usuario();

    if (!usuario || typeof window === 'undefined') {
      return;
    }

    const storageKey = this.authService.getStorageKeyForUser(usuario.email);
    window.localStorage.setItem(storageKey, JSON.stringify({ nextId: this.nextId, games }));
  }
}