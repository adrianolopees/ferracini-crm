import { Customer } from '@/schemas/customerSchema';
import { formatDateTime, getDaysBetween } from '@/utils';

interface HistoryCardProps {
  customer: Customer;
}

function HistoryCard({ customer }: HistoryCardProps) {
  return (
    <div className="border-l-4 border-l-emerald-500 bg-emerald-50/50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header : Name + Badge Total time*/}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 sm:gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Name */}
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>
          {/* Badge Total Time */}
          {customer.completedAt && (
            <span className="text-gray-500 text-xs px-2 py-1 rounded-full font-medium bg-gray-100 whitespace-nowrap">
              <i className="fa-solid fa-hourglass-end text-gray-700 text-[10px] pr-1"></i>
              {getDaysBetween(customer.createdAt, customer.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
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

        {/* Timeline + Phone */}
        {customer.completedAt && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
            <i className="fa-solid fa-circle-check text-gray-600 text-[10px]"></i>
            <span className="text-gray-500">Finalizado:</span>
            <span className="text-gray-700">{formatDateTime(customer.completedAt)}</span>
            <span className="text-gray-400">•</span>
            <i className="fa-solid fa-phone text-gray-600 text-[10px]"></i>
            <span className="text-gray-500">Contato:</span>
            <span className="text-gray-700">{customer.phone}</span>
          </div>
        )}
      </div>

      {/* Footer : sourceStore + Salesperson */}
      <div className="border-t mt-3 pt-2 border-emerald-200 flex flex-row sm:items-center justify-between gap-2">
        {/* Salesperson */}
        {customer.salesperson && (
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className="fa-solid fa-user text-[10px] text-gray-600"></i>
            <span className="font-medium text-gray-700">{customer.salesperson}</span>
          </div>
        )}
        {/* Badge de Origem */}
        {customer.sourceStore === 'Jundiaí' ? (
          // Reposição Local
          <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 px-2 py-1 rounded-full whitespace-nowrap">
            <i className="fa-solid fa-store text-[10px] text-gray-600"></i>
            <span className="font-medium text-gray-700">{customer.sourceStore}</span>
          </div>
        ) : customer.sourceStore === 'Campinas' || customer.sourceStore === 'Dom Pedro' ? (
          // Transferência de outra loja
          <div className="inline-flex items-center gap-1.5 text-xs bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
            <i className="fa-solid fa-truck-fast text-[10px] text-gray-600"></i>
            <span className="font-medium text-gray-700">{customer.sourceStore}</span>
          </div>
        ) : (
          // Sem origem definida (clientes antigos)
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-600">
            <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>
            <span className="font-medium">Adicionar origem</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryCard;
