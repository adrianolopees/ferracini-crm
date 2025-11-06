/**
 * TransferCard Component
 *
 * Card usado na página de Histórico > Transferências
 * Layout focado em relatório de transferências entre lojas
 *
 * Exibe:
 * - Loja de origem
 * - Timeline completa (solicitado, chegou, vendido)
 * - Tempo de transferência
 * - Tempo total do processo
 * - Informações do produto
 *
 * @module components/features/TransferCard
 */

import { Customer } from '@/types/customer';
import { formatDate, getDaysBetween } from '@/utils';

/* ============================================================================
 * CONSTANTS
 * ========================================================================= */

/**
 * Store-specific color schemes
 */
const STORE_COLORS = {
  Campinas: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50/30',
    icon: 'text-blue-500',
    storeBadge: 'bg-blue-500 text-white',
    timeline: 'border-blue-200',
  },
  'Dom Pedro': {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50/30',
    icon: 'text-purple-500',
    storeBadge: 'bg-purple-500 text-white',
    timeline: 'border-purple-200',
  },
} as const;

/* ============================================================================
 * HELPER FUNCTIONS
 * ========================================================================= */

/**
 * Get color configuration for store
 */
const getStoreColor = (storeName?: string) => {
  if (storeName === 'Campinas') return STORE_COLORS.Campinas;
  if (storeName === 'Dom Pedro') return STORE_COLORS['Dom Pedro'];
  return STORE_COLORS.Campinas; // Default
};

/* ============================================================================
 * TYPES
 * ========================================================================= */

interface TransferCardProps {
  customer: Customer;
}

/* ============================================================================
 * COMPONENT
 * ========================================================================= */

function TransferCard({ customer }: TransferCardProps) {
  const storeColor = getStoreColor(customer.sourceStore);

  return (
    <div
      className={`border-l-4 ${storeColor.border} ${storeColor.bg} rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200`}
    >
      {/* Header: Name + Transfer Time Badge + Store Badge */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>
          {customer.contactedAt && customer.transferredAt && (
            <span className={`${storeColor.icon} text-xs px-2 py-1 rounded font-medium whitespace-nowrap`}>
              <i className="fa-solid fa-truck-fast text-[10px] pr-1"></i>
              {getDaysBetween(customer.transferredAt, customer.contactedAt)}
            </span>
          )}
        </div>

        {/* Source Store */}
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${storeColor.storeBadge} px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0`}
        >
          <i className="fa-solid fa-location-dot text-[10px]"></i>
          {customer.sourceStore || 'N/A'}
        </span>
      </div>

      {/* Product Details | Timeline */}
      <div className="space-y-2 sm:space-y-3">
        {/* Product Details */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
          <span className="font-stretch-50% text-gray-900">{customer.model}</span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className={`fa-solid fa-barcode ${storeColor.icon} text-[10px]`}></i>
            {customer.reference}
          </span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className={`fa-solid fa-ruler ${storeColor.icon} text-[10px]`}></i>
            Nº {customer.size}
          </span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className={`fa-solid fa-palette ${storeColor.icon} text-[10px]`}></i>
            {customer.color}
          </span>
        </div>

        {/* Timeline  */}
        <div className="flex flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <i className={`fa-solid fa-clipboard-list ${storeColor.icon}`}></i>
            {formatDate(customer.createdAt)}
          </span>

          {customer.contactedAt && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <i className={`fa-solid fa-location-dot ${storeColor.icon}`}></i>
              {formatDate(customer.contactedAt)}
            </span>
          )}
          {customer.completedAt && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <i className={`fa-solid fa-circle-check ${storeColor.icon}`}></i>
              {formatDate(customer.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Salesperson */}
      <div className={`mt-2 pt-2 border-t ${storeColor.timeline} flex flex-row sm:items-center justify-between gap-2`}>
        {customer.salesperson && (
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className={`fa-solid fa-user ${storeColor.icon} text-[10px]`}></i>
            <span className="font-medium text-gray-700">{customer.salesperson}</span>
          </div>
        )}
        {/* Badge "Não vendido" (SÓ se arquivado) */}
        {customer.archived && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 sm:px-1 py-0.5 rounded-full whitespace-nowrap">
            <i className={`fa-solid fa-box-archive ${storeColor.icon} text-[10px]`}></i>
            Não vendido
          </span>
        )}
      </div>
    </div>
  );
}

export default TransferCard;
