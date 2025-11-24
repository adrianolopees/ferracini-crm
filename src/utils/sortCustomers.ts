import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting } from './date';

/**
 * Ordena lista de items por dias de espera (maior primeiro)
 * Otimizado: calcula daysWaiting apenas uma vez por item
 *
 * @template T - Tipo que estende objeto com propriedade createdAt
 * @param list - Lista de items para ordenar
 * @returns Nova lista ordenada (não muta o original)
 *
 * @example
 * const sorted = sortByDaysWaiting(customers);
 */
export function sortByDaysWaiting<T extends { createdAt: string }>(list: T[]): T[] {
  return list
    .map((item) => ({
      item,
      days: getDaysWaiting(item.createdAt),
    }))
    .sort((a, b) => b.days - a.days)
    .map(({ item }) => item);
}

/**
 * Ordena todas as listas de Customer de um objeto por dias de espera
 * Aplica sortByDaysWaiting em cada propriedade do objeto
 *
 * @template T - Tipo que é um Record de string para array de Customer
 * @param lists - Objeto contendo listas de customers
 * @returns Novo objeto com todas as listas ordenadas
 *
 * @example
 * const sorted = sortCustomerLists({ awaiting: [...], transfer: [...] });
 */
export function sortCustomerLists<T extends Record<string, Customer[]>>(lists: T): T {
  const sorted = {} as T;

  (Object.keys(lists) as Array<keyof T>).forEach((key) => {
    sorted[key] = sortByDaysWaiting(lists[key]) as T[keyof T];
  });

  return sorted;
}
