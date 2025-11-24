import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// Formatação de Datas
// ============================================

/**
 * Formata uma data ISO em formato brasileiro (dd/mm/aaaa)
 *
 * @param isoString - Data em formato ISO string
 * @returns Data formatada no padrão brasileiro
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z'); // "15/01/2024"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata uma data ISO em formato brasileiro com horário (dd/mm/aaaa às hh:mm)
 *
 * @param isoString - Data em formato ISO string
 * @returns Data e hora formatadas no padrão brasileiro
 *
 * @example
 * formatDateTime('2024-01-15T10:30:00Z'); // "15/01/2024 às 10:30"
 */
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

// ============================================
// Cálculos e Diferenças de Datas
// ============================================

/**
 * Calcula quantos dias se passaram desde uma data até hoje
 *
 * @param isoString - Data em formato ISO string
 * @returns Número de dias (arredondado para cima)
 *
 * @example
 * getDaysWaiting('2024-01-15T10:30:00Z'); // 10
 */
export function getDaysWaiting(isoString: string): number {
  const now = new Date();
  const created = new Date(isoString);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calcula a diferença em dias entre duas datas com formatação em português
 *
 * @param startDate - Data inicial em formato ISO string
 * @param endDate - Data final em formato ISO string
 * @returns Diferença formatada (ex: "1 dia", "5 dias")
 *
 * @example
 * getDaysBetween('2024-01-15', '2024-01-20'); // "5 dias"
 */
export function getDaysBetween(startDate: string, endDate: string): string {
  const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
}

/**
 * Retorna quanto tempo se passou desde uma data até agora
 *
 * @param isoString - Data em formato ISO string
 * @returns Tempo decorrido em formato legível (ex: "2 dias", "3 horas")
 *
 * @example
 * getTimeAgo('2024-01-15T10:30:00Z'); // "2 dias"
 */
export function getTimeAgo(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), {
    addSuffix: false,
    locale: ptBR,
  });
}

// ============================================
// Obtenção de Data Atual
// ============================================

/**
 * Retorna a data e hora atual em formato ISO string
 *
 * @returns Timestamp atual em formato ISO
 *
 * @example
 * getCurrentTimestamp(); // "2024-01-15T10:30:00.000Z"
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
