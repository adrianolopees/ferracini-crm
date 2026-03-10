import { z } from 'zod';
import { WorkspaceSchema } from './userSchema';
import { Timestamp } from 'firebase/firestore';

const BR_PHONE_REGEX = /^\([1-9][0-9]\)\s?9[0-9]{4}-[0-9]{4}$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const StoreSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string(),
  color: z.string(),
});

export type Store = z.infer<typeof StoreSchema>;

const TimestampSchema = z.union([z.string(), z.instanceof(Timestamp)]).transform((val) => {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  return val;
});

export const StoreSettingsSchema = z.object({
  workspaceId: WorkspaceSchema,
  stores: z.array(StoreSchema).min(1, 'Deve ter pelo menos 1 loja'),
  salespeople: z.array(z.string()).default([]),
  updatedAt: TimestampSchema,
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

export const StoreInputSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().regex(BR_PHONE_REGEX, 'Telefone deve estar no formato (XX) 9XXXX-XXXX'),
  color: z.string().regex(HEX_COLOR_REGEX, 'Cor deve ser hexadecimal'),
});
export type StoreInput = z.infer<typeof StoreInputSchema>;

export const CreateStoreSchema = StoreInputSchema;
export type CreateStore = z.infer<typeof CreateStoreSchema>;

export const UpdateStoreSchema = StoreInputSchema.partial();
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;
