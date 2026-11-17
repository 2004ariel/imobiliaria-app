// textos e cores dos selos de status (o backend manda o nome do enum)

const STATUS_IMOVEL: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  ALUGADO: 'Alugado',
  VENDIDO: 'Vendido'
};

const STATUS_OFERTA: Record<string, string> = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  EM_ESPERA: 'Em espera',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada'
};

const STATUS_CONTRATO: Record<string, string> = {
  AGUARDANDO_ASSINATURA: 'Aguardando assinatura',
  ASSINADO: 'Assinado',
  CANCELADO: 'Cancelado'
};

const FINALIDADE: Record<string, string> = {
  VENDA: 'Venda',
  ALUGUEL: 'Aluguel'
};

const TIPO_OFERTA: Record<string, string> = {
  VENDA: 'Compra',
  ALUGUEL: 'Aluguel'
};

// classes definidas em styles.scss
const COR_VERDE = 'status-disponivel';
const COR_AMARELA = 'status-reservado';
const COR_AZUL = 'status-andamento';
const COR_VERMELHA = 'status-negativo';
const COR_CINZA = 'status-indisponivel';

export function rotuloStatusImovel(status: string | null): string {
  return status ? (STATUS_IMOVEL[status] ?? status) : 'Sem status';
}

export function classeStatusImovel(status: string | null): string {
  if (status === 'DISPONIVEL') return COR_VERDE;
  if (status === 'RESERVADO') return COR_AMARELA;
  return COR_CINZA;
}

export function rotuloStatusOferta(status: string): string {
  return STATUS_OFERTA[status] ?? status;
}

export function classeStatusOferta(status: string): string {
  if (status === 'ACEITA') return COR_VERDE;
  if (status === 'PENDENTE') return COR_AMARELA;
  if (status === 'EM_ESPERA') return COR_AZUL;
  if (status === 'RECUSADA') return COR_VERMELHA;
  return COR_CINZA;
}

export function rotuloStatusContrato(status: string): string {
  return STATUS_CONTRATO[status] ?? status;
}

export function classeStatusContrato(status: string): string {
  if (status === 'ASSINADO') return COR_VERDE;
  if (status === 'AGUARDANDO_ASSINATURA') return COR_AMARELA;
  return COR_CINZA;
}

export function rotuloTipoOferta(tipo: string): string {
  return TIPO_OFERTA[tipo] ?? tipo;
}

export function rotuloFinalidade(finalidade: string): string {
  return FINALIDADE[finalidade] ?? finalidade;
}

// cores dos gráficos do painel (mesma ideia dos selos, em tom mais forte para o gráfico)
export const COR_GRAFICO_STATUS_OFERTA: Record<string, string> = {
  PENDENTE: '#d49b00',
  ACEITA: '#1a7f37',
  EM_ESPERA: '#3b6db3',
  RECUSADA: '#b00020',
  CANCELADA: '#8a8f98'
};

export const COR_GRAFICO_FINALIDADE: Record<string, string> = {
  VENDA: '#1f3a5f',
  ALUGUEL: '#e07a1f'
};

// opções dos filtros do admin (ordem do fluxo)
export const OPCOES_STATUS_OFERTA = Object.entries(STATUS_OFERTA).map(([valor, rotulo]) => ({ valor, rotulo }));
export const OPCOES_STATUS_CONTRATO = Object.entries(STATUS_CONTRATO).map(([valor, rotulo]) => ({ valor, rotulo }));
