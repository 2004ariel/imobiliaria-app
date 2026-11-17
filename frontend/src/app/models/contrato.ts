import { Oferta } from './oferta';

export type StatusContrato = 'AGUARDANDO_ASSINATURA' | 'ASSINADO' | 'CANCELADO';

export interface Contrato {
  id: number;
  oferta: Oferta;
  status: StatusContrato;
  dataAprovacao: string | null;
  dataAssinatura: string | null;
  emailEnviado?: boolean | null; // só vem na resposta do "aprovar"
}
