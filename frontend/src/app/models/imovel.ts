export interface Bairro {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
  cepInicial?: string | null;
  cepFinal?: string | null;
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
  destaque?: boolean | null;
  tipoImovel: TipoImovel | null;
  bairro: Bairro | null;
  fotoCapa: string | null; // nome do arquivo da capa (só vem na vitrine)
}

export interface FotoImovel {
  id: number;
  nomeArquivo: string;
  capa: boolean;
  ordem: number;
}

// corpo do POST/PUT /imoveis (admin); tipo e bairro vão só com o id
export interface ImovelForm {
  titulo: string;
  descricao: string;
  finalidade: string;
  status: string;
  precoVenda: number | null;
  precoAluguel: number | null;
  dormitorios: number | null;
  banheiros: number | null;
  garagem: number | null;
  areaTotal: number | null;
  areaConstruida: number | null;
  endereco: string;
  numero: string;
  complemento: string;
  cep: string;
  caracteristicas: string;
  destaque: boolean;
  tipoImovel: { id: number };
  bairro: { id: number };
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
