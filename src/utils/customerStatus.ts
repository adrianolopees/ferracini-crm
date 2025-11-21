import { getDaysWaiting } from '@/utils/date';

export function getCustomerStatus(createdAt: string, status?: string) {
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
