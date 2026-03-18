import {
  format,
  formatDistanceToNow,
  differenceInDays,
  parseISO,
  isValid,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Faz o parse seguro de uma data ISO
 */
function parseDate(isoString: string): Date | null {
  if (!isoString) return null;

  const date = parseISO(isoString);
  return isValid(date) ? date : null;
}

/**
 * Formata data no padrão brasileiro: dd/MM/yyyy
 *
 * @example formatDate('2024-01-15T10:30:00Z') // "15/01/2024"
 */
export function formatDate(isoString: string): string {
  const date = parseDate(isoString);
  if (!date) return '';

  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata data e hora: dd/MM/yyyy às HH:mm
 *
 * @example formatDateTime('2024-01-15T10:30:00Z') // "15/01/2024 às 10:30"
 */
export function formatDateTime(isoString: string): string {
  const date = parseDate(isoString);
  if (!date) return '';

  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Retorna quantos dias se passaram desde a data até hoje
 *
 * - Nunca retorna negativo
 * - Arredonda corretamente via date-fns
 *
 * @example getDaysWaiting('2024-01-15T10:30:00Z') // 10
 */
export function getDaysWaiting(isoString: string): number {
  const date = parseDate(isoString);
  if (!date) return 0;

  const now = new Date();

  if (date > now) return 0;

  return differenceInDays(now, date);
}

/**
 * Retorna diferença em dias entre duas datas
 *
 * - Sempre >= 1
 * - Retorna número (não string → melhor para reuso)
 *
 * @example getDaysBetween('2024-01-15', '2024-01-20') // 5
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return 0;

  const diff = differenceInDays(end, start);

  return Math.max(1, diff);
}

/**
 * Formata dias em string amigável
 *
 * @example formatDays(2) // "2 dias"
 */
export function formatDays(days: number): string {
  return `${days} dia${days !== 1 ? 's' : ''}`;
}

/**
 * Retorna tempo relativo (ex: "há 2 dias")
 *
 * @example getTimeAgo('2024-01-15T10:30:00Z')
 */
export function getTimeAgo(isoString: string): string {
  const date = parseDate(isoString);
  if (!date) return '';

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}

/**
 * Retorna timestamp atual em ISO
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
