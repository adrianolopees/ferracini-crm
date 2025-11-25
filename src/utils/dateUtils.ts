import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** @example formatDate('2024-01-15T10:30:00Z') // "15/01/2024" */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** @example formatDateTime('2024-01-15T10:30:00Z') // "15/01/2024 às 10:30" */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} às ${timeStr}`;
}

/**
 * Calcula quantos dias se passaram desde uma data até hoje
 * Arredonda para cima para considerar dias parciais
 *
 * @example getDaysWaiting('2024-01-15T10:30:00Z') // 10
 */
export function getDaysWaiting(isoString: string): number {
  const now = new Date();
  const created = new Date(isoString);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calcula diferença entre datas com formatação em português
 * Retorna no mínimo "1 dia" mesmo para diferenças menores
 *
 * @example getDaysBetween('2024-01-15', '2024-01-20') // "5 dias"
 */
export function getDaysBetween(startDate: string, endDate: string): string {
  const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
}

/**
 * Retorna tempo decorrido em formato humanizado usando date-fns
 *
 * @example getTimeAgo('2024-01-15T10:30:00Z') // "2 dias"
 */
export function getTimeAgo(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), {
    addSuffix: false,
    locale: ptBR,
  });
}

/** Retorna data/hora atual em formato ISO string */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
