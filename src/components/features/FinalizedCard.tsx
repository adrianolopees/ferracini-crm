/**
 * HistoryCard Component
 *
 * Card usado na página de Histórico > Finalizados
 * Exibe vendas concluídas com foco em métricas e timeline
 *
 * Exibe:
 * - Data de conclusão
 * - Tempo total do processo
 * - Loja de origem (se houver)
 * - Vendedor responsável
 * - Produto completo
 *
 * @module components/features/HistoryCard
 */

import { Customer } from '@/types/customer';
import { formatDateTime, formatDaysElapsed } from '@/utils';

/* ============================================================================
 * TYPES
 * ========================================================================= */

interface HistoryCardProps {
  customer: Customer;
}

/* ============================================================================
 * COMPONENT
 * ========================================================================= */

function HistoryCard({ customer }: HistoryCardProps) {
  return (
    <div className="border-l-4 border-l-emerald-500 bg-emerald-50/50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header : Name + Badge Total time + Salesperson*/}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 text-base">
            {customer.name}
          </h3>

          {/* Badge Total Time */}
          {customer.completedAt && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-purple-500 text-xs px-2 py-0.5 rounded font-medium bg-purple-50">
                <i className="fa-solid fa-hourglass-end text-purple-500 text-[10px] pr-1"></i>
                {formatDaysElapsed(customer.createdAt, customer.completedAt)}
              </span>
            </div>
          )}
          {/* Salesperson */}
          {customer.salesperson && (
            <div className="inline-flex items-center gap-1.5 text-xs">
              <i className=" fa-solid fa-user text-gray-600 text-xs"></i>
              <span className="font-medium text-gray-700">
                {customer.salesperson}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Product Details */}
      <div className="space-y-3 gap-3 md:gap-4">
        <div className="space-y-3 gap-3 md:gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span className="font-stretch-50% text-gray-900">
              {customer.model}
            </span>
            <i className="fa-solid fa-arrow-right text-gray-400 text-[10px]"></i>
            <span className="flex items-center gap-1">
              <i className={`fa-solid fa-barcode  text-[10px]`}></i>
              {customer.reference}
            </span>

            <span className="text-gray-400">•</span>

            <span className="flex items-center gap-1">
              <i className={`fa-solid fa-ruler  text-[10px]`}></i>
              Nº {customer.size}
            </span>

            <span className="text-gray-400">•</span>

            <span className="flex items-center gap-1">
              <i className={`fa-solid fa-palette  text-[10px]`}></i>
              {customer.color}
            </span>
          </div>

          {/* Métricas */}
          {customer.completedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
              {customer.completedAt && (
                <>
                  <i className="fa-solid fa-circle-check text-emerald-500"></i>
                  <span className="text-gray-500">Finalizado:</span>
                  <span className="text-gray-700">
                    {formatDateTime(customer.completedAt)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <i className="fa-solid fa-phone text-emerald-500"></i>
                  <span className="text-gray-700">{customer.phone}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-t mt-3 pt-2 border-emerald-200 flex items-center gap-2">
        {/* Badge de Origem */}
        {customer.sourceStore === 'Jundiaí' ? (
          // Reposição Local
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className="fa-solid fa-box text-emerald-600"></i>
            <span className="font-medium text-emerald-700">
              Reposição Local
            </span>
          </div>
        ) : customer.sourceStore === 'Campinas' ||
          customer.sourceStore === 'Dom Pedro' ? (
          // Transferência de outra loja
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className="fa-solid fa-store text-blue-600"></i>
            <span className="font-medium text-blue-700">
              Transferência do {customer.sourceStore}
            </span>
          </div>
        ) : (
          // Sem origem definida (clientes antigos)
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-600">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span className="font-medium">Adicionar origem</span>
          </div>
        )}
      </div>{' '}
    </div>
  );
}

export default HistoryCard;
