export type CustomerStatus =
  | 'aguardando'
  | 'aguardando_transferencia'
  | 'contactado'
  | 'finalizado';

export interface Customer {
  id: string;
  cliente: string;
  celular: string;
  modelo: string;
  referencia: string;
  numeracao: string;
  cor: string;
  vendedor?: string;
  dataCriacao: string;
  status?: CustomerStatus;
  dataContacto?: string;
  dataTransferencia?: string;
  dataFinalizacao?: string;
  lojaOrigem?: string;
  _isFromContactedCollection?: boolean;
}

export interface ContactedCustomer extends Customer {
  dataContacto: string;
}
