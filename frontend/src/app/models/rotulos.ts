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
