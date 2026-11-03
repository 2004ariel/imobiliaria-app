export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}

// dados lidos do payload do JWT (o login só devolve o token)
export interface UsuarioLogado {
  email: string;
  role: string;
}
