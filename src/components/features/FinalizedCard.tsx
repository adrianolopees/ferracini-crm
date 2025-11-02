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
      {/* Two Column Layout: Customer Info | Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* LEFT COLUMN: Customer Information */}
        <div className="space-y-2">
          {/* Name + Success Icon + Salesperson */}
          <div className="flex items-center flex-wrap gap-2">
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
          </div>

          {/* Completion Metrics */}
          {customer.completedAt && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {/* Completion Date */}
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-check text-emerald-600 text-xs"></i>
                <span className="font-medium text-emerald-700">
                  {formatDateTime(customer.completedAt)}
                </span>
              </div>

              <span className="text-gray-300">•</span>

              {/* Total Time */}
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-hourglass-end text-purple-600 text-xs"></i>
                <span className="text-purple-700">
                  {formatDaysElapsed(customer.createdAt, customer.completedAt)}
                </span>
              </div>

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
            </div>
          )}

          {/* Phone Number */}
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-phone text-gray-500 text-xs"></i>
            <span className="text-sm text-gray-600">{customer.phone}</span>
          </div>

          {/* Timeline Section */}
          {(customer.transferredAt || customer.contactedAt) && (
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <div className="flex items-center gap-1.5 mb-2">
                <i className="fa-solid fa-timeline text-emerald-600 text-xs"></i>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Timeline
                </span>
              </div>
              <div className="space-y-1 text-xs">
                {/* Created */}
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-plus text-gray-400 text-[10px]"></i>
                  <span className="text-gray-500">Criado:</span>
                  <span className="text-gray-700">
                    {formatDateTime(customer.createdAt)}
                  </span>
                </div>

                {/* Transferred */}
                {customer.transferredAt && (
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-truck text-blue-500 text-[10px]"></i>
                    <span className="text-gray-500">Transferido:</span>
                    <span className="text-gray-700">
                      {formatDateTime(customer.transferredAt)}
                    </span>
                  </div>
                )}

                {/* Ready for Pickup */}
                {customer.contactedAt && (
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-box text-green-500 text-[10px]"></i>
                    <span className="text-gray-500">Disponível:</span>
                    <span className="text-gray-700">
                      {formatDateTime(customer.contactedAt)}
                    </span>
                  </div>
                )}

                {/* Completed */}
                {customer.completedAt && (
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i>
                    <span className="text-gray-500">Finalizado:</span>
                    <span className="text-gray-700">
                      {formatDateTime(customer.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-box text-gray-400 text-sm"></i>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Produto
            </span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div>
              <p className="font-bold text-gray-900 text-base">
                {customer.model}
              </p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">{customer.reference}</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-gray-600">
                <span className="font-semibold">Nº</span> {customer.size}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                <span className="font-semibold">Cor</span> {customer.color}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryCard;
