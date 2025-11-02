/**
 * ArchivedCard Component
 *
 * Card usado na página de Histórico > Arquivados
 * Layout compacto com foco no motivo do arquivamento
 *
 * Exibe:
 * - Motivo do arquivamento em destaque
 * - Produto em linha compacta
 * - Timeline de arquivamento (quando foi arquivado, tempo aguardando)
 * - Notas/observações
 * - Ações: Restaurar e Excluir
 *
 * @module components/features/ArchivedCard
 */

import { Customer, ArchiveReason } from '@/types/customer';
import { formatDistanceToNow, formatDaysElapsed } from '@/utils';

/* ============================================================================
 * CONSTANTS
 * ========================================================================= */

/**
 * Archive reason labels (Portuguese)
 */
const ARCHIVE_REASON_LABELS: Record<ArchiveReason, string> = {
  gave_up: 'Desistiu',
  no_response: 'Não Respondeu',
  bought_elsewhere: 'Comprou Fora',
  product_unavailable: 'Indisponível',
  other: 'Outro',
};

/**
 * Archive reason visual styles
 */
const ARCHIVE_REASON_COLORS: Record<
  ArchiveReason,
  { icon: string; bg: string; text: string; border: string }
> = {
  gave_up: {
    icon: 'fa-circle-xmark',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-l-red-500',
  },
  no_response: {
    icon: 'fa-comment-slash',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-l-yellow-500',
  },
  bought_elsewhere: {
    icon: 'fa-store-slash',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-l-purple-500',
  },
  product_unavailable: {
    icon: 'fa-box-open',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-l-orange-500',
  },
  other: {
    icon: 'fa-archive',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-l-gray-500',
  },
};

/* ============================================================================
 * HELPER FUNCTIONS
 * ========================================================================= */

/**
 * Get localized label for archive reason
 */
const getArchiveReasonLabel = (reason?: ArchiveReason): string => {
  return reason ? ARCHIVE_REASON_LABELS[reason] : 'Arquivado';
};

/**
 * Get color configuration for archive reason
 */
const getArchiveReasonColor = (reason?: ArchiveReason) => {
  return reason ? ARCHIVE_REASON_COLORS[reason] : ARCHIVE_REASON_COLORS.other;
};

/* ============================================================================
 * TYPES
 * ========================================================================= */

interface ArchivedCardProps {
  customer: Customer;
  onRestore?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

/* ============================================================================
 * COMPONENT
 * ========================================================================= */

function ArchivedCard({
  customer,
  onRestore,
  onDelete,
}: ArchivedCardProps) {
  const reasonColors = getArchiveReasonColor(customer.archiveReason);
  const reasonLabel = getArchiveReasonLabel(customer.archiveReason);

  // Calculate days waiting before archive
  const daysWaiting = customer.archivedAt
    ? formatDaysElapsed(customer.createdAt, customer.archivedAt)
    : null;

  return (
    <div
      className={`border-l-4 ${reasonColors.border} ${reasonColors.bg} rounded-lg p-3 hover:shadow-md transition-shadow duration-200`}
    >
      {/* Header: Name + Salesperson + Reason Badge */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 text-sm">
            {customer.name}
          </h3>
          {customer.salesperson && (
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
              @{customer.salesperson}
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${reasonColors.bg} ${reasonColors.text} px-2 py-0.5 rounded-full border ${reasonColors.border}`}
        >
          <i className={`fa-solid ${reasonColors.icon} text-[10px]`}></i>
          {reasonLabel}
        </span>
      </div>

      {/* Product Info - Compact Single Line */}
      <div className="mb-2 text-xs text-gray-700">
        <i className="fa-solid fa-box text-gray-400 text-[10px] mr-1"></i>
        <span className="font-semibold">{customer.model}</span>
        <span className="text-gray-400 mx-1">•</span>
        <span>{customer.reference}</span>
        <span className="text-gray-400 mx-1">•</span>
        <span>Nº {customer.size}</span>
        <span className="text-gray-400 mx-1">•</span>
        <span>{customer.color}</span>
      </div>

      {/* Archive Timeline */}
      <div className="space-y-1 text-xs mb-2">
        {customer.archivedAt && (
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-calendar-xmark text-gray-400 text-[10px]"></i>
            <span className="text-gray-600">Arquivado há</span>
            <span className="font-medium text-gray-900">
              {formatDistanceToNow(customer.archivedAt)}
            </span>
          </div>
        )}
        {daysWaiting && (
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-clock text-gray-400 text-[10px]"></i>
            <span className="text-gray-600">Ficou</span>
            <span className="font-medium text-gray-900">{daysWaiting}</span>
            <span className="text-gray-600">aguardando</span>
          </div>
        )}
      </div>

      {/* Notes/Observations */}
      {customer.notes && (
        <div className="text-xs bg-white/50 rounded px-2 py-1.5 border border-gray-200 mb-2">
          <i className="fa-solid fa-comment-dots text-gray-400 text-[10px] mr-1"></i>
          <span className="text-gray-600 italic">"{customer.notes}"</span>
        </div>
      )}

      {/* Action Buttons */}
      {(onRestore || onDelete) && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          {onRestore && (
            <button
              onClick={() => onRestore(customer)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
              title="Restaurar para Pronto para Retirada"
            >
              <i className="fa-solid fa-arrow-rotate-left text-[10px]"></i>
              <span>Restaurar</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(customer)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
              title="Excluir permanentemente"
            >
              <i className="fa-solid fa-trash text-[10px]"></i>
              <span>Excluir</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ArchivedCard;
