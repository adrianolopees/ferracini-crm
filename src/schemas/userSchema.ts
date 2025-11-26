import { z } from 'zod';

export const WorkspaceSchema = z.enum(['real', 'demo']);

export const UserShcema = z.object({
  uid: z.string(),
  email: z.email(),
  workspaceId: WorkspaceSchema,
  displayName: z.string().optional(),
  createdAt: z.string(),
});

export const FirebaseUserSchema = UserShcema.omit({ uid: true });

export type User = z.infer<typeof UserShcema>;
export type WorkspaceId = z.infer<typeof WorkspaceSchema>;
