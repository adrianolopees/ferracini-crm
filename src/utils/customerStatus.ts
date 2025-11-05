import { getDaysWaiting } from '@/utils/date';

export function getCustomerStatus(createdAt: string) {
  const daysWaiting = getDaysWaiting(createdAt);

  // Vermelho: 7 dias ou mais
  if (daysWaiting >= 14) {
    return {
      daysWaiting,
      urgency: 'urgent' as const,
      borderClass: 'border-l-red-500 border-red-200',
      dotClass: 'bg-red-500',
      textClass: 'text-red-500 font-medium',
      iconClass: 'text-red-500',
      label: 'Urgente - 14 dias ou mais',
    };
  }

  // Amarelo: Entre 7 e 13 dias
  if (daysWaiting >= 7) {
    return {
      daysWaiting,
      urgency: 'warning' as const,
      borderClass: 'border-l-yellow-500 border-yellow-200',
      dotClass: 'bg-yellow-500',
      textClass: 'text-yellow-600 font-medium',
      iconClass: 'text-yellow-600',
      label: 'Atenção - 7 e 13 dias',
    };
  }

  // Verde: Até 6 dias
  return {
    daysWaiting,
    urgency: 'normal' as const,
    borderClass: 'border-l-green-500 border-gray-200',
    dotClass: 'bg-green-500',
    textClass: 'text-green-600 font-medium',
    iconClass: 'text-green-600',
    label: 'Recente - até 6 dias',
  };
}
