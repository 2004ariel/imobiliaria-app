import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import {
  ArcElement, BarController, BarElement, CategoryScale, ChartConfiguration, DoughnutController, Legend, LinearScale,
  PieController, Tooltip
} from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { PainelService } from '../../services/painel.service';
import { Painel } from '../../models/painel';
import { ErroApi } from '../../models/erro-api';
import {
  COR_GRAFICO_FINALIDADE, COR_GRAFICO_STATUS_OFERTA, rotuloFinalidade, rotuloStatusOferta
} from '../../models/rotulos';

// legenda embaixo e tooltip "rótulo: N" para os gráficos de pizza/rosca
const OPCOES_PIZZA: ChartConfiguration<'pie' | 'doughnut'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { callbacks: { label: (item) => ` ${item.label}: ${item.parsed}` } }
  }
};

@Component({
  selector: 'app-admin-inicio',
  imports: [RouterLink, BaseChartDirective],
  // registra só as peças usadas (barras, rosca, pizza, legenda, tooltip).
  // Fica aqui, e não no app.config, para o Chart.js ir junto com o painel (rota carregada sob demanda)
  providers: [
    provideCharts({
      registerables: [BarController, BarElement, CategoryScale, LinearScale, DoughnutController, PieController, ArcElement, Legend, Tooltip]
    })
  ],
  templateUrl: './admin-inicio.html',
  styleUrl: './admin-inicio.scss'
})
export class AdminInicio implements OnInit {
  auth = inject(AuthService);
  private painelService = inject(PainelService);

  painel = signal<Painel | null>(null);
  carregando = signal(true);
  erro = signal('');

  // dados já no formato do Chart.js (montados quando o painel chega)
  graficoBairros = signal<ChartConfiguration<'bar'>['data'] | null>(null);
  graficoOfertas = signal<ChartConfiguration<'doughnut'>['data'] | null>(null);
  graficoFinalidade = signal<ChartConfiguration<'pie'>['data'] | null>(null);

  // barras deitadas: nomes de bairro longos cabem melhor no celular
  opcoesBarras: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (item) => ` ${item.parsed.x} imóvel(is)` } }
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Imóveis' } }
    }
  };
  opcoesOfertas = OPCOES_PIZZA as ChartConfiguration<'doughnut'>['options'];
  opcoesFinalidade = OPCOES_PIZZA as ChartConfiguration<'pie'>['options'];

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.painelService.buscar().subscribe({
      next: (painel) => {
        this.painel.set(painel);
        this.montarGraficos(painel);
        this.carregando.set(false);
      },
      error: (e: ErroApi) => {
        this.erro.set(e.status === 0 ? e.mensagem : 'Não foi possível carregar o painel. Tente novamente mais tarde.');
        this.carregando.set(false);
      }
    });
  }

  // gráfico sem nenhum valor vira mensagem "sem dados" em vez de um quadro em branco
  private montarGraficos(painel: Painel): void {
    const bairros = painel.imoveisPorBairro;
    this.graficoBairros.set(soma(bairros) === 0 ? null : {
      labels: bairros.map((b) => b.nome),
      datasets: [{ data: bairros.map((b) => b.total), label: 'Imóveis', backgroundColor: '#1f3a5f', borderRadius: 4 }]
    });

    const ofertas = painel.ofertasPorSituacao;
    this.graficoOfertas.set(soma(ofertas) === 0 ? null : {
      labels: ofertas.map((o) => rotuloStatusOferta(o.status)),
      datasets: [{ data: ofertas.map((o) => o.total), backgroundColor: ofertas.map((o) => COR_GRAFICO_STATUS_OFERTA[o.status] ?? '#999') }]
    });

    const finalidades = painel.imoveisPorFinalidade;
    this.graficoFinalidade.set(soma(finalidades) === 0 ? null : {
      labels: finalidades.map((f) => rotuloFinalidade(f.finalidade)),
      datasets: [{ data: finalidades.map((f) => f.total), backgroundColor: finalidades.map((f) => COR_GRAFICO_FINALIDADE[f.finalidade] ?? '#999') }]
    });
  }

  // texto alternativo do gráfico para leitor de tela: "Centro: 6, Vila Nova: 3"
  resumo(dados: { labels?: unknown[]; datasets: { data: unknown[] }[] }): string {
    return (dados.labels ?? []).map((rotulo, i) => `${rotulo}: ${dados.datasets[0].data[i]}`).join(', ');
  }
}

function soma(itens: { total: number }[]): number {
  return itens.reduce((acc, item) => acc + item.total, 0);
}
