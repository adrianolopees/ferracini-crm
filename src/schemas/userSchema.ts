import { z } from 'zod';

export const WorkspaceSchema = z.enum(['maxi', 'demo']);

export const UserSchema = z.object({
  uid: z.string(),
  email: z.email(),
  workspaceId: WorkspaceSchema,
  displayName: z.string().optional(),
  createdAt: z.string(),
});

export const FirebaseUserSchema = UserSchema.omit({ uid: true });

export type User = z.infer<typeof UserSchema>;
export type WorkspaceId = z.infer<typeof WorkspaceSchema>;
