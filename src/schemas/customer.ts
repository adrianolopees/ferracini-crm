import { z } from 'zod';

// Schemas para os enums
export const CustomerStatusSchema = z.enum(['pending', 'awaiting_transfer', 'ready_for_pickup', 'completed']);

export const ArchiveReasonSchema = z.enum([
  'gave_up',
  'no_response',
  'bought_elsewhere',
  'product_unavailable',
  'other',
  'exceeded_wait_time',
]);

// Schema principal do Customer
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  model: z.string(),
  reference: z.string(),
  size: z.string(),
  color: z.string(),
  salesperson: z.string().optional(),
  createdAt: z.string(),
  status: CustomerStatusSchema.optional(),
  contactedAt: z.string().nullable().optional(),
  transferredAt: z.string().nullable().optional(),
  completedAt: z.string().optional(),
  sourceStore: z.enum(['Campinas', 'Dom Pedro', 'Jundiaí']).nullable().optional(),
  archived: z.boolean().optional(),
  archiveReason: ArchiveReasonSchema.nullable().optional(),
  archivedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  consultingStore: z.enum(['Campinas', 'Dom Pedro']).nullable().optional(),
  storeHasStock: z.boolean().optional(),
});
// Inferir os tipos do Zod
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerStatus = z.infer<typeof CustomerStatusSchema>;
export type ArchiveReason = z.infer<typeof ArchiveReasonSchema>;
