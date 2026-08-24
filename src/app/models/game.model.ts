export type GameStatus = 'pendente' | 'jogando' | 'finalizado';

export interface Game {
  id: number;
  nome: string;
  imagem: string;
  estrelas: number; // 0.5 a 5
  dataInicial: string;
  dataFinal?: string;
  favorito: boolean;
  wishlist: boolean;
  status: GameStatus;
}