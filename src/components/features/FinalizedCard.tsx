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
      {/* Name + Success Icon + Salesperson */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 text-lg">
            {customer.name}
          </h3>
          <i
            className="fa-solid fa-circle-check text-emerald-600"
            title="Venda Concluída"
          />
          {customer.salesperson && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {customer.salesperson}
            </span>
          )}

          {/* Source Store (if exists) */}
          {customer.sourceStore && (
            <>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-store text-blue-600 text-xs"></i>
                <span className="text-blue-700">{customer.sourceStore}</span>
              </div>
            </>
          )}

          {/* Completion Metrics */}
          {customer.completedAt && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {/* Completion Date */}
              <>
                <i className="fa-solid fa-calendar-check text-emerald-600 text-xs"></i>
                <span className="font-medium text-emerald-700">
                  {formatDateTime(customer.completedAt)}
                </span>
              </>

              <span className="text-gray-300">•</span>

              {/* Total Time */}
              <>
                <i className="fa-solid fa-hourglass-end text-purple-600 text-xs"></i>
                <span className="text-purple-700">
                  {formatDaysElapsed(customer.createdAt, customer.completedAt)}
                </span>
              </>
            </div>
          )}
          {/* Phone Number */}
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-phone text-gray-500 text-xs"></i>
            <span className="text-sm text-gray-600">{customer.phone}</span>
          </div>

          {/* Product Details */}
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

          {/* Timeline Section */}
          {(customer.transferredAt || customer.contactedAt) && (
            <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
              <div className="flex-1">
                {/* Created */}
                <i className="fa-solid fa-circle-plus text-gray-400 text-[10px]"></i>
                <span className="text-gray-500">Criado:</span>
                <span className="text-gray-700">
                  {formatDateTime(customer.createdAt)}
                </span>

                {/* Transferred */}
                {customer.transferredAt && (
                  <>
                    <i className="fa-solid fa-truck text-blue-500 text-[10px]"></i>
                    <span className="text-gray-500">Transferido:</span>
                    <span className="text-gray-700">
                      {formatDateTime(customer.transferredAt)}
                    </span>
                  </>
                )}
              </div>

              <div className="flex-1">
                {/* Ready for Pickup */}
                {customer.contactedAt && (
                  <>
                    <i className="fa-solid fa-box text-green-500 text-[10px]"></i>
                    <span className="text-gray-500">Disponível:</span>
                    <span className="text-gray-700">
                      {formatDateTime(customer.contactedAt)}
                    </span>
                  </>
                )}

                {/* Completed */}
                {customer.completedAt && (
                  <>
                    <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i>
                    <span className="text-gray-500">Finalizado:</span>
                    <span className="text-gray-700">
                      {formatDateTime(customer.completedAt)}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryCard;
