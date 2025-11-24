import { getDaysWaiting } from './dateUtils';

export interface CustomerStatusInfo {
  daysWaiting: number;
  borderClass: string;
  textClass: string;
  iconClass: string;
  label: string;
}

/**
 * Retorna informações visuais e textuais baseadas no status do customer
 * Calcula dias de espera e retorna classes CSS apropriadas para cada status
 *
 * @param createdAt - Data de criação do customer em formato ISO string
 * @param status - Status atual do customer (opcional)
 * @returns Objeto com informações de estilo e label do status
 *
 * @example
 * getCustomerStatus('2024-01-15', 'pending');
 * // { daysWaiting: 10, borderClass: 'border-l-blue-500...', label: 'Aguardando', ... }
 */
export function getCustomerStatus(createdAt: string, status?: string): CustomerStatusInfo {
  const daysWaiting = getDaysWaiting(createdAt);

  if (status === 'awaitingTransfer') {
    return {
      daysWaiting,
      borderClass: 'border-l-orange-500 border-orange-200',
      textClass: 'text-orange-600',
      iconClass: 'text-orange-500',
      label: 'Em transferência',
    };
  }

  if (status === 'readyForPickup') {
    return {
      daysWaiting,
      borderClass: 'border-l-green-500 border-green-200 ',
      textClass: 'text-gray-600',
      iconClass: 'text-gray-500',
      label: 'Pronto para retirada',
    };
  }

  if (status === 'pending') {
    return {
      daysWaiting,
      borderClass: 'border-l-blue-500 border-blue-200 ',
      textClass: 'text-gray-600',
      iconClass: 'text-gray-500',
      label: 'Aguardando',
    };
  }

  return {
    daysWaiting,
    borderClass: 'border-l-gray-400 border-gray-200 ',
    textClass: 'text-gray-600',
    iconClass: 'text-gray-500',
    label: 'Inicial',
  };
}
