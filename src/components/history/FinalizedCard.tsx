import { Customer } from '@/schemas/customerSchema';
import { formatDate, getDaysBetween } from '@/utils';
import useStoreSettings from '@/hooks/useStoreSettings';

interface HistoryCardProps {
  customer: Customer;
}

function HistoryCard({ customer }: HistoryCardProps) {
  const { defaultStore, transferStores } = useStoreSettings();
  const isDefaultStore = customer.sourceStore === defaultStore?.name;
  const isTransferStore = transferStores.some((s) => s.name === customer.sourceStore);

  const cycleDays =
    customer.createdAt && customer.completedAt
      ? getDaysBetween(customer.createdAt, customer.completedAt)
      : null;

  return (
    <div className="border-l-4 border-l-emerald-500 bg-emerald-50/50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header: Name */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 sm:gap-3">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>
        {cycleDays && (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
            <i className="fa-solid fa-stopwatch text-[10px]"></i>
            Ciclo: {cycleDays}
          </span>
        )}
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

        {/* Timeline */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <i className="fa-solid fa-calendar-plus text-emerald-600 text-[10px]"></i>
            <span className="text-gray-500">Registrado:</span>
            {formatDate(customer.createdAt)}
          </span>
          {customer.completedAt && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <i className="fa-solid fa-circle-check text-emerald-600 text-[10px]"></i>
              <span className="text-gray-500">Finalizado:</span>
              {formatDate(customer.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Salesperson + Phone + Store Badge */}
      <div className="border-t mt-3 pt-2 border-emerald-200 flex flex-row sm:items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {customer.salesperson && (
            <div className="inline-flex items-center gap-1.5 text-xs">
              <i className="fa-solid fa-user text-[10px] text-emerald-600"></i>
              <span className="font-medium text-gray-700">{customer.salesperson}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className="fa-solid fa-phone text-[10px] text-emerald-600"></i>
            <span className="text-gray-600">{customer.phone}</span>
          </div>
        </div>

        {/* Badge de Origem */}
        {isDefaultStore ? (
          <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 px-2 py-1 rounded-full whitespace-nowrap">
            <i className="fa-solid fa-store text-[10px] text-gray-600"></i>
            <span className="font-medium text-gray-700">{customer.sourceStore}</span>
          </div>
        ) : isTransferStore ? (
          <div className="inline-flex items-center gap-1.5 text-xs bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
            <i className="fa-solid fa-truck-fast text-[10px] text-gray-600"></i>
            <span className="font-medium text-gray-700">{customer.sourceStore}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default HistoryCard;
