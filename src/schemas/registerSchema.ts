import { z } from 'zod';

export const formSchema = z.object({
  cliente: z.string().min(1, 'Cliente não pode estar em branco!').trim(),
  celular: z
    .string()
    .min(1, 'Celular não pode estar em branco!')
    .length(15, 'Número incompleto!'),
  modelo: z
    .string()
    .min(1, 'Modelo não pode estar em branco!')
    .trim()
    .refine((val) => isNaN(Number(val)), 'Somente letras!'),
  referencia: z.string().min(1, 'REF não pode estar em branco!').trim(),
  numeracao: z.string().min(1, 'Nº não pod estar em branco!'),
  cor: z
    .string()
    .min(1, ' Cor nao pode estar em branco!')
    .trim()
    .refine((val) => isNaN(Number(val)), 'Somente letras!'),
});

export type FormData = z.infer<typeof formSchema>;
export type FormErrors = Partial<Record<keyof FormData, string>>;
