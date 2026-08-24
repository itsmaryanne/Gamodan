import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type Membro = {
  nome: string;
  email: string;
  linkedin: string;
  github: string;
};

@Component({
  selector: 'app-contato',
  imports: [],
  templateUrl: './contato.html',
  styleUrl: './contato.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contato {
  private readonly membros = signal<Membro[]>([
    {
      nome: 'Bianca Brandão',
      email: 'bianca.brandao.bbs@gmail.com',
      linkedin: 'https://www.linkedin.com/in/bianca-brand%C3%A3o-6810393b4/',
      github: 'https://github.com/Bianca-Brandao',
    },
    {
      nome: 'Maria Eduarda',
      email: 'mariaeduarda19@gmail.com',
      linkedin: 'https://www.linkedin.com/in/maria-eduarda-gon%C3%A7alo-3aa84837b/',
      github: 'https://github.com/',
    },
    {
      nome: 'Maryanne',
      email: 'maryannemqs@gmail.com',
      linkedin: 'https://linkedin.com/in/mary-marques',
      github: 'https://github.com/itsmaryanne',
    },
    {
      nome: 'Estela Nunes',
      email: 'estelanunes889@gmail.com',
      linkedin: 'https://www.linkedin.com/in/estelabnunes1506/?skipRedirect=true',
      github: 'https://github.com/estelanunes889',
    },
    {
      nome: 'Kethyn',
      email: 'kethyncris123@gmail.com',
      linkedin: 'https://linkedin.com/in/kethyn-cris-653033424',
      github: 'https://github.com/Kethynoliveira1-dev',
    },
    {
      nome: 'Marcelli',
      email: 'martinsmarcelli06@gmail.com',
      linkedin: 'https://linkedin.com/in/marcelli-ferreira-nestor-martins-a60b26411',
      github: 'https://github.com/martinsmarcelli06-ctrl',
    },
    {
      nome: 'Ana Luiza',
      email: 'analuiza.rochacoelho09@gmail.com',
      linkedin: 'https://www.linkedin.com/in/ana-luiza-d2312',
      github: 'https://github.com/analuiza2312',
    },
    {
      nome: 'Livia',
      email: 'liviamendonca123456@gmail.com',
      linkedin: 'https://www.linkedin.com/in/livia-mendonca-779604368',
      github: 'https://github.com/Livia126',
    },
  ]);

  readonly busca = signal('');

  readonly membrosFiltrados = computed(() => {
    const termo = this.normalizarTexto(this.busca());

    if (!termo) {
      return this.membros();
    }

    return this.membros().filter(membro => this.normalizarTexto(membro.nome).includes(termo));
  });

  atualizarBusca(valor: string): void {
    this.busca.set(valor);
  }

  emailLink(email: string): string {
    return `mailto:${email}`;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

}