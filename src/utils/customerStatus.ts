import { getDaysWaiting } from '@/utils/formatDate';

export function getCustomerStatus(createdAt: string) {
  const daysWaiting = getDaysWaiting(createdAt);

  // Vermelho: 7 dias ou mais
  if (daysWaiting >= 7) {
    return {
      daysWaiting,
      urgency: 'urgent' as const,
      borderClass: 'border-l-red-500 border-red-200',
      dotClass: 'bg-red-500',
      textClass: 'text-red-600 font-semibold',
      label: 'Urgente - 7 dias ou mais',
    };
  }

  // Amarelo: Entre 4 e 6 dias
  if (daysWaiting >= 4) {
    return {
      daysWaiting,
      urgency: 'warning' as const,
      borderClass: 'border-l-yellow-500 border-yellow-200',
      dotClass: 'bg-yellow-500',
      textClass: 'text-gray-500',
      label: 'Atenção - 4 a 6 dias',
    };
  }

  // Verde: Até 3 dias
  return {
    daysWaiting,
    urgency: 'normal' as const,
    borderClass: 'border-l-green-500 border-gray-200',
    dotClass: 'bg-green-500',
    textClass: 'text-gray-500',
    label: 'Recente - até 3 dias',
  };
}
