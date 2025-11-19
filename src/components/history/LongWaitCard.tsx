/**
 * LongWaitCard Component
 *
 * Card usado na página de Histórico > Espera Longa
 * Layout compacto para clientes aguardando há mais de 30 dias
 *
 * Exibe:
 * - Tempo de espera em destaque
 * - Produto em linha compacta
 * - Data de registro
 * - Ações: Contactar e Arquivar
 *
 * @module components/history/LongWaitCard
 */

import { Customer } from '@/schemas/customerSchema';
import { formatDate, getDaysWaiting } from '@/utils';

interface LongWaitCardProps {
  customer: Customer;
  onContact?: (customer: Customer) => void;
  onReadyForPickup?: (customer: Customer) => void;
  onArchive?: (customer: Customer) => void;
}

function LongWaitCard({ customer, onContact, onReadyForPickup, onArchive }: LongWaitCardProps) {
  const daysWaiting = getDaysWaiting(customer.createdAt);

  return (
    <div className="border-l-4 border-l-red-400 bg-red-50/50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header - Time awaiting and customer name*/}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 sm:gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>
          {/* Badge days awaiting*/}
          <span className="text-red-500 text-xs px-2 py-1 rounded-full font-medium bg-red-100 whitespace-nowrap">
            <i className="fa-solid fa-clock text-red-600 text-[10px] pr-1"></i>
            Esperando há {daysWaiting} dias
          </span>
        </div>
        {/* Register date */}
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500">Registrado em</p>
          <p className="text-sm font-medium text-gray-700">{formatDate(customer.createdAt)}</p>
        </div>
      </div>

      {/* Product details */}
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

      {/* Footer: Salesperson + Action Buttons */}
      <div className="border-t mt-2 pt-2 border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Salesperson*/}
        {customer.salesperson && (
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className="fa-solid fa-user text-[10px] text-gray-600"></i>
            <span className="font-medium text-gray-700">{customer.salesperson}</span>
          </div>
        )}

        {/* Buttons actions*/}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {onContact && (
            <button
              onClick={() => onContact(customer)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full transition-colors border border-blue-200 cursor-pointer min-h-[44px] sm:min-h-0"
              title="Contactar via WhatsApp"
            >
              <i className="fa-brands fa-whatsapp text-[10px]"></i>
              <span>Contactar</span>
            </button>
          )}
          {onReadyForPickup && (
            <button
              onClick={() => onReadyForPickup(customer)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full transition-colors border border-green-200 cursor-pointer min-h-[44px] sm:min-h-0"
              title="Marcar como pronto para retirada"
            >
              <i className="fa-solid fa-box-open text-[10px]"></i>
              <span>Pronto</span>
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => onArchive(customer)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-full transition-colors border border-gray-200 cursor-pointer min-h-[44px] sm:min-h-0"
              title="Arquivar cliente"
            >
              <i className="fa-solid fa-archive text-[10px]"></i>
              <span>Arquivar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LongWaitCard;
