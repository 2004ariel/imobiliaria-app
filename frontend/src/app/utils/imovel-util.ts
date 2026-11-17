import { Imovel } from '../models/imovel';

// aluguel mostra o preço do aluguel; o resto mostra o preço de venda
export function ehAluguel(imovel: Imovel): boolean {
  return imovel.finalidade?.toUpperCase() === 'ALUGUEL';
}

export function precoPrincipal(imovel: Imovel): number | null {
  return ehAluguel(imovel) ? imovel.precoAluguel : (imovel.precoVenda ?? imovel.precoAluguel);
}
