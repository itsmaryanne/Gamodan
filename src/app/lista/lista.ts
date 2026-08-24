import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameService } from '../services/game';

@Component({
  selector: 'app-lista',
  imports: [],
  templateUrl: './lista.html',
  styleUrl: './lista.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lista {
  private readonly gameService = inject(GameService);

  jogos = computed(() => [...this.gameService.games()].sort((a, b) => b.id - a.id));

}