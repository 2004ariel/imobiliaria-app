import { Imovel } from '../models/imovel';

// aluguel mostra o preço do aluguel; o resto mostra o preço de venda
export function ehAluguel(imovel: Imovel): boolean {
  return imovel.finalidade?.toUpperCase() === 'ALUGUEL';
}

export function precoPrincipal(imovel: Imovel): number | null {
  return ehAluguel(imovel) ? imovel.precoAluguel : (imovel.precoVenda ?? imovel.precoAluguel);
}

// o backend manda o enum (DISPONIVEL, RESERVADO, ALUGADO, VENDIDO); aqui vira texto e cor do selo
const ROTULOS_STATUS: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  ALUGADO: 'Alugado',
  VENDIDO: 'Vendido'
};

export function rotuloStatus(status: string | null): string {
  if (!status) return 'Sem status';
  return ROTULOS_STATUS[status] ?? status;
}

export function classeStatus(status: string | null): string {
  if (status === 'DISPONIVEL') return 'status-disponivel';
  if (status === 'RESERVADO') return 'status-reservado';
  return 'status-indisponivel';
}
