export type CustomerStatus = 'pending' | 'awaiting_transfer' | 'ready_for_pickup' | 'completed';

export type ArchiveReason =
  | 'gave_up'
  | 'no_response'
  | 'bought_elsewhere'
  | 'product_unavailable'
  | 'other'
  | 'exceeded_wait_time';

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
  contactedAt?: string | null;
  transferredAt?: string | null;
  completedAt?: string;
  sourceStore?: 'Campinas' | 'Dom Pedro' | 'Jundiaí' | null;
  archived?: boolean;
  archiveReason?: ArchiveReason | null;
  archivedAt?: string | null;
  notes?: string | null;
  consultingStore?: 'Campinas' | 'Dom Pedro' | null;
  storeHasStock?: boolean;
}
