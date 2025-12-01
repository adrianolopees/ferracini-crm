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

export const CustomerSchema = z
  .object({
    id: z.string().min(1),
    workspaceId: WorkspaceSchema,

    name: z.string().min(1, 'Nome é obrigatório').trim(),
    phone: z.string().min(1, 'Telefone é obrigatório').trim(),
    model: z.string().min(1, 'Modelo é obrigatório').trim(),
    reference: z.string().min(1, 'Referência é obrigatória').trim(),
    size: z.string().min(1, 'Tamanho é obrigatório').trim(),
    color: z.string().min(1, 'Cor é obrigatória').trim(),
    salesperson: z.string().min(1, 'Vendedor é obrigatório').trim(),

    createdAt: z.string(),
    contactedAt: z.string().optional(),
    transferredAt: z.string().optional(),
    completedAt: z.string().optional(),

    status: CustomerStatusSchema.default('pending'),

    // sourceStore: define origem do produto
    // - undefined: ainda não definido (pending inicial)
    // - 'Campinas'/'Dom Pedro': transferência aceita
    // - 'Jundiaí': reposição local
    sourceStore: SourceStoreSchema.optional(),

    // ==========================================
    // CONSULTA TEMPORÁRIA (durante workflow)
    // ==========================================
    consultingStore: ConsultingStoreSchema.optional(),
    storeHasStock: z.boolean().optional(),

    archived: z.boolean().default(false),
    archiveReason: ArchiveReasonSchema.optional(),
    archivedAt: z.string().optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => {
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

export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerStatus = z.infer<typeof CustomerStatusSchema>;
export type ArchiveReason = z.infer<typeof ArchiveReasonSchema>;
export type SourceStore = z.infer<typeof SourceStoreSchema>;
export type ConsultingStore = z.infer<typeof ConsultingStoreSchema>;
