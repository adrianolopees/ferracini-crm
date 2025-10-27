import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'Cliente não pode estar em branco!').trim(),
  phone: z
    .string()
    .min(1, 'Celular não pode estar em branco!')
    .length(15, 'Número incompleto!'),
  model: z
    .string()
    .min(1, 'Modelo não pode estar em branco!')
    .trim()
    .refine((val) => isNaN(Number(val)), 'Somente letras!'),
  reference: z.string().min(1, 'REF não pode estar em branco!').trim(),
  size: z.string().min(1, 'Nº não pod estar em branco!'),
  color: z
    .string()
    .min(1, ' Cor nao pode estar em branco!')
    .trim()
    .refine((val) => isNaN(Number(val)), 'Somente letras!'),
  salesperson: z.string().min(1, 'Vendedor não pode estar em branco!').trim(),
});

export type FormData = z.infer<typeof formSchema>;
export type FormErrors = Partial<Record<keyof FormData, string>>;
