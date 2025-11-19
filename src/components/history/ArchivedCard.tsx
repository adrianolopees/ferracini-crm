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

import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import { getTimeAgo, getDaysBetween } from '@/utils';

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
  exceeded_wait_time: 'Tempo Excedido',
  other: 'Outro',
};

/* ============================================================================
 * HELPER FUNCTIONS
 * ========================================================================= */

/**
 * Get localized label for archive reason
 */
const getArchiveReasonLabel = (reason?: ArchiveReason | null): string => {
  return reason ? ARCHIVE_REASON_LABELS[reason] : 'Arquivado';
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

function ArchivedCard({ customer, onRestore, onDelete }: ArchivedCardProps) {
  const reasonLabel = getArchiveReasonLabel(customer.archiveReason);

  // Calculate days waiting before archive
  const daysWaiting = customer.archivedAt ? getDaysBetween(customer.createdAt, customer.archivedAt) : null;

  return (
    <div className="border-l-4 border-l-gray-400 bg-gray-50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header: Name + Days Waiting Badge */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 sm:gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>

          {/* Badge Days Waiting */}
          {daysWaiting && (
            <span className="text-gray-500 text-xs px-2 py-1 rounded-full font-medium bg-gray-200 whitespace-nowrap">
              <i className="fa-solid fa-clock text-gray-600 text-[10px] pr-1"></i>
              {daysWaiting}
            </span>
          )}
        </div>

        {/* Archive Reason Badge */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-gray-200 whitespace-nowrap">
          <i className="fa-solid fa-box-archive text-[10px] text-gray-600"></i>
          <span className="text-gray-700">{reasonLabel}</span>
        </span>
      </div>

      {/* Product Info - Same format as other cards */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap mb-2">
        <span className="font-stretch-50% text-gray-900">{customer.model}</span>
        <i className="fa-solid fa-arrow-right text-gray-400 text-[10px]"></i>
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-barcode text-[10px]"></i>
          {customer.reference}
        </span>
        <span className="text-gray-400">•</span>
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-ruler text-[10px]"></i>
          Nº {customer.size}
        </span>
        <span className="text-gray-400">•</span>
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-palette text-[10px]"></i>
          {customer.color}
        </span>
      </div>

      {/* Archive Timeline */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 flex-wrap mb-2">
        {customer.archivedAt && (
          <>
            <i className="fa-solid fa-calendar-xmark text-gray-600 text-[10px]"></i>
            <span className="text-gray-500">Arquivado:</span>
            <span className="text-gray-700">{getTimeAgo(customer.archivedAt)}</span>
          </>
        )}
      </div>

      {/* Notes/Observations */}
      {customer.notes && (
        <div className="text-xs bg-white/50 rounded px-2 py-1.5 border border-gray-200 mb-2">
          <i className="fa-solid fa-comment-dots text-gray-400 text-[10px] mr-1"></i>
          <span className="text-gray-600 italic">"{customer.notes}"</span>
        </div>
      )}

      {/* Footer: Salesperson + Action Buttons */}
      <div className="border-t mt-2 pt-2 border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Salesperson */}
        {customer.salesperson && (
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className="fa-solid fa-user text-[10px] text-gray-600"></i>
            <span className="font-medium text-gray-700">{customer.salesperson}</span>
          </div>
        )}

        {/* Action Buttons - Empilhados em mobile, lado a lado em desktop */}
        {(onRestore || onDelete) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {onRestore && (
              <button
                onClick={() => onRestore(customer)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full transition-colors border border-blue-200 cursor-pointer min-h-[44px] sm:min-h-0"
                title="Restaurar para Pronto para Retirada"
              >
                <i className="fa-solid fa-arrow-rotate-left text-[10px]"></i>
                <span>Restaurar</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(customer)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-medium rounded-full transition-colors border border-red-200 cursor-pointer min-h-[44px] sm:min-h-0"
                title="Excluir permanentemente"
              >
                <i className="fa-solid fa-trash text-[10px]"></i>
                <span>Excluir</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchivedCard;
