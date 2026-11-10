import { Imovel } from '../models/imovel';

// aluguel mostra o preço do aluguel; o resto mostra o preço de venda
export function ehAluguel(imovel: Imovel): boolean {
  return imovel.finalidade?.toUpperCase() === 'ALUGUEL';
}

export function precoPrincipal(imovel: Imovel): number | null {
  return ehAluguel(imovel) ? imovel.precoAluguel : (imovel.precoVenda ?? imovel.precoAluguel);
}

// classe CSS do selo de status. O status ainda é texto livre no banco
// ("Disponível", "DISPONIVEL"...), então tira acento e caixa só para escolher a cor.
export function classeStatus(status: string | null): string {
  const s = (status ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (s === 'disponivel') return 'status-disponivel';
  if (s === 'reservado') return 'status-reservado';
  return 'status-indisponivel';
}
