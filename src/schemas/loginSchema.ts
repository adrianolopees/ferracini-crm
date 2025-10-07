import { z } from 'zod';

export const loginShcema = z.object({
  email: z
    .string('Email inválido!')
    .min(1, 'Email não pode estar em branco!')
    .trim(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres!').trim(),
});

export type LoginFormData = z.infer<typeof loginShcema>;
