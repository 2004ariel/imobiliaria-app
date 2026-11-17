import { Bairro, TipoImovel } from './imovel';

export type TipoOferta = 'VENDA' | 'ALUGUEL';
export type StatusOferta = 'PENDENTE' | 'ACEITA' | 'EM_ESPERA' | 'RECUSADA' | 'CANCELADA';

// o imóvel que vem dentro da oferta é um resumo (sem descrição, sem foto)
export interface ImovelResumo {
  id: number;
  titulo: string;
  status: string;
  finalidade: string;
  precoVenda: number | null;
  precoAluguel: number | null;
  tipoImovel: TipoImovel | null;
  bairro: Bairro | null;
}

export interface Oferta {
  id: number;
  imovel: ImovelResumo;
  tipo: TipoOferta;
  valorProposto: number;
  mensagem: string | null;
  status: StatusOferta;
  dataCriacao: string;
}

// corpo do POST /ofertas (o usuário vai pelo token)
export interface NovaOferta {
  imovelId: number;
  tipo: TipoOferta;
  valorProposto: number;
  mensagem: string;
}
