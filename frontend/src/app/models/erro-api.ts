// formato de erro que o authInterceptor entrega para as telas (nunca o JSON cru)
export interface ErroApi {
  status: number;
  mensagem: string;
}
