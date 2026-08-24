import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Game } from '../models/game.model';
import { GameService } from '../services/game';
import { AuthService, type AuthMode } from '../services/auth';

type Aba = 'favoritos' | 'recentemente';
type SlotCarrossel = 'single' | 'center' | 'prev' | 'next';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class Home implements OnDestroy {
  private readonly gameService = inject(GameService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private autoplayId: ReturnType<typeof setInterval> | null = null;
  readonly estrelasDisponiveis = [1, 2, 3, 4, 5];

  abaAtiva = signal<Aba>('recentemente');
  modalAberto = signal(false);
  detalheAberto = signal(false);
  jogoSelecionado = signal<Game | null>(null);
  indiceAtual = signal(0);

  // % de scroll da página, de 0 a 100 - usado pra animar o gradiente
  scrollPercent = signal(0);

  jogosFiltrados = computed(() => {
    const todos = this.gameService.games();
    const aba = this.abaAtiva();

    if (aba === 'favoritos') {
      return todos.filter(j => j.favorito);
    }
    // "recentemente" - os últimos adicionados primeiro
    return [...todos].sort((a, b) => b.id - a.id);
  });

  jogosCarrossel = computed(() => this.jogosFiltrados().slice(0, 5));
  carrosselVisivel = computed(() => {
    const jogos = this.jogosCarrossel();
    const total = jogos.length;

    if (total === 0) {
      return [];
    }

    if (total === 1) {
      return [{ jogo: jogos[0], indiceOriginal: 0, slot: 'single' as SlotCarrossel }];
    }

    if (total === 2) {
      const centro = this.indiceAtual() % 2;
      const proximo = (centro + 1) % 2;

      return [
        { jogo: jogos[centro], indiceOriginal: centro, slot: 'center' as SlotCarrossel },
        { jogo: jogos[proximo], indiceOriginal: proximo, slot: 'next' as SlotCarrossel },
      ];
    }

    const centro = this.indiceAtual();
    const anterior = (centro - 1 + total) % total;
    const proximo = (centro + 1) % total;

    return [
      { jogo: jogos[anterior], indiceOriginal: anterior, slot: 'prev' as SlotCarrossel },
      { jogo: jogos[centro], indiceOriginal: centro, slot: 'center' as SlotCarrossel },
      { jogo: jogos[proximo], indiceOriginal: proximo, slot: 'next' as SlotCarrossel },
    ];
  });

  readonly temMultiplosJogos = computed(() => this.jogosCarrossel().length > 1);
  readonly rotuloFiltro = computed(() =>
    this.abaAtiva() === 'recentemente' ? 'Adicionados recentemente' : 'Favoritos'
  );
  readonly proximoFiltro = computed(() =>
    this.abaAtiva() === 'recentemente' ? 'Favoritos' : 'Adicionados recentemente'
  );

  readonly formJogo = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    imagem: ['', [Validators.required]],
    estrelas: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]],
    dataInicial: ['', [Validators.required]],
    dataFinal: [''],
    favorito: [false],
    wishlist: [false],
    status: ['pendente' as const],
  });

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly cadastroForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    effect(
      () => {
        const total = this.jogosCarrossel().length;
        const modalAberto = this.modalAberto();

        if (total === 0) {
          this.indiceAtual.set(0);
        }

        if (total > 0 && this.indiceAtual() >= total) {
          this.indiceAtual.set(0);
        }

        this.configurarAutoplay(total, modalAberto);
      },
      { allowSignalWrites: true }
    );
  }

  selecionarAba(aba: Aba) {
    this.abaAtiva.set(aba);
    this.indiceAtual.set(0);
  }

  alternarAba() {
    if (!this.authService.autenticado()) {
      this.authService.abrirModal('entrar');
      return;
    }

    this.selecionarAba(this.abaAtiva() === 'recentemente' ? 'favoritos' : 'recentemente');
  }

  abrirAutenticacao(modo: 'entrar' | 'criar') {
    this.authService.abrirModal(modo);
  }

  fecharAutenticacao() {
    this.authService.fecharModal();
  }

  trocarAutenticacao(modo: AuthMode) {
    this.authService.abrirModal(modo);
  }

  entrar() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const dados = this.loginForm.getRawValue();
    this.authService.login({
      nome: dados.email.split('@')[0],
      email: dados.email,
      senha: dados.senha,
    });
    this.loginForm.reset({ email: '', senha: '' });
  }

  criarConta() {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const dados = this.cadastroForm.getRawValue();
    this.authService.register(dados);
    this.cadastroForm.reset({ nome: '', email: '', senha: '' });
  }

  onScroll() {
    const alturaTotal = document.body.scrollHeight - window.innerHeight;
    const percentual = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    this.scrollPercent.set(percentual);
  }

  abrirModal() {
    if (!this.authService.autenticado()) {
      this.authService.abrirModal('entrar');
      return;
    }

    this.jogoSelecionado.set(null);
    this.detalheAberto.set(false);
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  abrirDetalhes(jogo: Game) {
    if (!this.authService.autenticado()) {
      this.authService.abrirModal('entrar');
      return;
    }

    this.modalAberto.set(false);
    this.jogoSelecionado.set(jogo);
    this.detalheAberto.set(true);
  }

  fecharDetalhes() {
    this.detalheAberto.set(false);
    this.jogoSelecionado.set(null);
  }

  avancar() {
    if (!this.authService.autenticado()) {
      this.authService.abrirModal('entrar');
      return;
    }

    const total = this.jogosCarrossel().length;
    if (total <= 1) {
      return;
    }
    this.indiceAtual.update(valor => (valor + 1) % total);
  }

  voltar() {
    if (!this.authService.autenticado()) {
      this.authService.abrirModal('entrar');
      return;
    }

    const total = this.jogosCarrossel().length;
    if (total <= 1) {
      return;
    }
    this.indiceAtual.update(valor => (valor - 1 + total) % total);
  }

  irPara(indice: number) {
    if (!this.authService.autenticado()) {
      this.authService.abrirModal('entrar');
      return;
    }

    this.indiceAtual.set(indice);
  }

  estadoEstrela(valor: number, estrela: number) {
    const diferenca = valor - (estrela - 1);

    if (diferenca >= 1) {
      return 'cheia';
    }

    if (diferenca >= 0.5) {
      return 'meia';
    }

    return 'vazia';
  }

  definirEstrelas(estrela: number, event: MouseEvent) {
    const alvo = event.currentTarget as HTMLElement | null;
    if (!alvo) {
      return;
    }

    const retangulo = alvo.getBoundingClientRect();
    const clicouNaMetadeEsquerda = event.detail > 0 && event.clientX - retangulo.left <= retangulo.width / 2;
    const valor = clicouNaMetadeEsquerda ? estrela - 0.5 : estrela;
    const valorNormalizado = Math.min(5, Math.max(0.5, valor));

    this.formJogo.controls.estrelas.setValue(valorNormalizado);
  }

  legendaEstrela(valor: number) {
    const cheio = Math.floor(valor);
    const meio = valor % 1 >= 0.5 ? 1 : 0;
    return `${cheio} estrelas${meio ? ' e meio' : ''}`;
  }

  formatarDataBrasil(data: string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T00:00:00`));
  }

  nomeEstrela(valor: number) {
    return `${valor} estrela${valor > 1 ? 's' : ''}`;
  }

  salvarJogo() {
    if (!this.authService.autenticado()) {
      this.authService.abrirModal('entrar');
      return;
    }

    if (this.formJogo.invalid) {
      this.formJogo.markAllAsTouched();
      return;
    }

    const valor = this.formJogo.getRawValue();

    this.gameService.addGame({
      nome: valor.nome,
      imagem: valor.imagem,
      estrelas: valor.estrelas,
      dataInicial: valor.dataInicial,
      dataFinal: valor.dataFinal || undefined,
      favorito: valor.favorito,
      wishlist: valor.wishlist,
      status: valor.status,
    });

    this.formJogo.reset({
      nome: '',
      imagem: '',
      estrelas: 3,
      dataInicial: '',
      dataFinal: '',
      favorito: false,
      wishlist: false,
      status: 'pendente',
    });

    this.abaAtiva.set('recentemente');
    this.indiceAtual.set(0);
    this.fecharModal();
  }

  ngOnDestroy() {
    this.limparAutoplay();
  }

  private configurarAutoplay(total: number, modalAberto: boolean) {
    this.limparAutoplay();

    if (total <= 1 || modalAberto) {
      return;
    }

    this.autoplayId = setInterval(() => {
      this.avancar();
    }, 3500);
  }

  private limparAutoplay() {
    if (this.autoplayId !== null) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }

}