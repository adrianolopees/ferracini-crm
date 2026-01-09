import { z } from 'zod';
import { WorkspaceSchema } from './userSchema';

export const StoreSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().regex(/^\([1-9]{2}\)\s?9[0-9]{4}-[0-9]{4}$/, 'Telefone deve estar no formato (11) 98888-8888'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser hexadecimal'),
});

export type Store = z.infer<typeof StoreSchema>;

export const StoreSettingsSchema = z.object({
  workspaceId: WorkspaceSchema,
  stores: z.array(StoreSchema).min(1, 'Deve ter pelo menos 1 loja'),
  updatedAt: z.string(),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

export const CreateStoreSchema = StoreSchema.omit({ id: true });
export type CreateStore = z.infer<typeof CreateStoreSchema>;

export const UpdateStoreSchema = CreateStoreSchema.partial();
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;
