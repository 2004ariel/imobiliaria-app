export interface Bairro {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
}

export interface Imovel {
  id: number;
  titulo: string;
  descricao: string;
  finalidade: string;
  status: string;
  precoVenda: number | null;
  precoAluguel: number | null;
  dormitorios: number;
  banheiros: number;
  garagem: number;
  bairro: Bairro | null;
}
