import { z } from 'zod';
import { WorkspaceSchema } from './userSchema';

export const CustomerStatusSchema = z.enum(['pending', 'awaitingTransfer', 'readyForPickup', 'completed']);

export const SourceStoreSchema = z.enum(['Campinas', 'Dom Pedro', 'Jundiaí']);

export const ConsultingStoreSchema = z.enum(['Campinas', 'Dom Pedro']);

export const ArchiveReasonSchema = z.enum([
  'gave_up',
  'no_response',
  'bought_elsewhere',
  'product_unavailable',
  'other',
  'exceeded_wait_time',
]);

export const CustomerSchema = z.object({
  // ==========================================
  // IDENTIFICAÇÃO (gerados automaticamente)
  // ==========================================
  id: z.string().min(1),
  workspaceId: WorkspaceSchema,

  // ==========================================
  // INFORMAÇÕES BÁSICAS (obrigatórias no registro)
  // ==========================================
  name: z.string().min(1, 'Nome é obrigatório').trim(),
  phone: z.string().min(1, 'Telefone é obrigatório').trim(),
  model: z.string().min(1, 'Modelo é obrigatório').trim(),
  reference: z.string().min(1, 'Referência é obrigatória').trim(),
  size: z.string().min(1, 'Tamanho é obrigatório').trim(),
  color: z.string().min(1, 'Cor é obrigatória').trim(),
  salesperson: z.string().min(1, 'Vendedor é obrigatório').trim(),

  // ==========================================
  // DATAS (só createdAt é obrigatória)
  // ==========================================
  createdAt: z.string(),
  contactedAt: z.string().optional(),     // Existe quando cliente é contatado
  transferredAt: z.string().optional(),   // Existe quando entra em transferência
  completedAt: z.string().optional(),     // Existe quando venda é finalizada

  // ==========================================
  // STATUS E FLUXO
  // ==========================================
  status: CustomerStatusSchema.default('pending'),

  // sourceStore: define origem do produto
  // - undefined: ainda não definido (pending inicial)
  // - 'Campinas'/'Dom Pedro': transferência aceita
  // - 'Jundiaí': reposição local
  sourceStore: SourceStoreSchema.optional(),

  // ==========================================
  // CONSULTA TEMPORÁRIA (durante workflow)
  // ==========================================
  consultingStore: ConsultingStoreSchema.optional(), // Loja sendo consultada
  storeHasStock: z.boolean().optional(),             // Loja tem estoque?

  // ==========================================
  // ARQUIVAMENTO
  // ==========================================
  archived: z.boolean().default(false),
  archiveReason: ArchiveReasonSchema.optional(), // Obrigatório se archived=true
  archivedAt: z.string().optional(),             // Obrigatório se archived=true
  notes: z.string().trim().optional(),           // Sempre opcional
})
.refine(
  (data) => {
    // Validação: Se arquivado, deve ter motivo e data
    if (data.archived) {
      return !!data.archiveReason && !!data.archivedAt;
    }
    return true;
  },
  {
    message: 'Cliente arquivado deve ter motivo e data de arquivamento',
    path: ['archiveReason'],
  }
);

export const FirebaseCustomerSchema = CustomerSchema.omit({ id: true });

// ==========================================
// TYPES
// ==========================================

export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerStatus = z.infer<typeof CustomerStatusSchema>;
export type ArchiveReason = z.infer<typeof ArchiveReasonSchema>;
export type SourceStore = z.infer<typeof SourceStoreSchema>;
export type ConsultingStore = z.infer<typeof ConsultingStoreSchema>;
