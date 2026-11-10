export interface Bairro {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
}

export interface TipoImovel {
  id: number;
  nome: string;
  descricao: string;
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
  areaTotal: number | null;
  areaConstruida: number | null;
  endereco: string;
  numero: string;
  complemento: string;
  cep: string;
  caracteristicas: string;
  tipoImovel: TipoImovel | null;
  bairro: Bairro | null;
}

export interface FotoImovel {
  id: number;
  nomeArquivo: string;
  capa: boolean;
  ordem: number;
}

// corpo do POST /imoveis/sabermais/{id}
export interface SaberMais {
  imovelId: number;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
}

// filtros da vitrine (todos opcionais), espelham os parâmetros do GET /imoveis
export interface FiltrosImovel {
  finalidade?: string;
  tipoId?: string;
  bairroId?: string;
  dormitorios?: string;
  precoMin?: string;
  precoMax?: string;
  sort?: string;
  page?: number;
  size?: number;
}
