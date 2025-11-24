import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (isoString: string): string => {
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
};

export const getTimeAgo = (isoString: string): string => {
  return formatDistanceToNow(new Date(isoString), {
    addSuffix: false,
    locale: ptBR,
  });
};

export const getDaysWaiting = (isoString: string): number => {
  const now = new Date();
  const created = new Date(isoString);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getDaysBetween = (startDate: string, endDate: string): string => {
  const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
