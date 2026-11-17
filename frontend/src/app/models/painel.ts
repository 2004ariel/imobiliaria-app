// resposta do GET /painel
export interface Painel {
  totais: {
    imoveisDisponiveis: number;
    ofertasPendentes: number;
    contratosAguardandoAssinatura: number;
  };
  imoveisPorBairro: { nome: string; total: number }[];
  ofertasPorSituacao: { status: string; total: number }[];
  imoveisPorFinalidade: { finalidade: string; total: number }[];
}
