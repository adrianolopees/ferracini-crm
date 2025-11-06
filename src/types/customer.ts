export type CustomerStatus = 'pending' | 'awaiting_transfer' | 'ready_for_pickup' | 'completed';

export type ArchiveReason = 'gave_up' | 'no_response' | 'bought_elsewhere' | 'product_unavailable' | 'other';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  model: string;
  reference: string;
  size: string;
  color: string;
  salesperson?: string;
  createdAt: string;
  status?: CustomerStatus;
  contactedAt?: string;
  transferredAt?: string;
  completedAt?: string;
  sourceStore?: 'Campinas' | 'Dom Pedro' | 'Jundiaí';
  archived?: boolean;
  archiveReason?: ArchiveReason;
  archivedAt?: string;
  notes?: string;
  consultingStore?: 'Campinas' | 'Dom Pedro';
  storeHasStock?: boolean;
}
