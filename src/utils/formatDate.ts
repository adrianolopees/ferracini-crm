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
