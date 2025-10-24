import { formatDistanceToNow as fnsFormatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDistanceToNow = (isoString: string): string => {
  return fnsFormatDistanceToNow(new Date(isoString), {
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

export const formatDateTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDaysElapsed = (startDate: string, endDate: string): string => {
  const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Menos de 1 dia';
  return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
};
