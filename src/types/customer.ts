export type CustomerStatus =
  | 'aguardando'
  | 'aguardando_transferencia'
  | 'contactado'
  | 'finalizado';

export type ArchiveReason =
  | 'Desistiu'
  | 'Não respondeu'
  | 'Comprou concorrente'
  | 'Produto não disponível'
  | 'Outro';

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
  arquivado?: boolean;
  motivoArquivamento?: ArchiveReason;
  dataArquivamento?: string;
  observacoes?: string;
  consultandoLoja?: 'Campinas' | 'Dom Pedro';
  lojaTemEstoque?: boolean;
}

export interface ContactedCustomer extends Customer {
  dataContacto: string;
}
