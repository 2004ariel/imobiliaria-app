export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}

// corpo do POST/PUT /users (senha vazia na edição = mantém a atual)
export interface UsuarioForm {
  nome: string;
  email: string;
  senha: string | null;
  tipo: string;
}

// dados lidos do payload do JWT (o login só devolve o token)
export interface UsuarioLogado {
  email: string;
  role: string;
}
