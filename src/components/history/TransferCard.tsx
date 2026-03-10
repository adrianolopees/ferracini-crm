import { Customer } from '@/schemas/customerSchema';
import { formatDate, getDaysBetween } from '@/utils';
import useStoreSettings from '@/hooks/useStoreSettings';

interface TransferCardProps {
  customer: Customer;
}

function TransferCard({ customer }: TransferCardProps) {
  const { transferStores } = useStoreSettings();
  const storeColor = transferStores.find((s) => s.name === customer.sourceStore)?.color ?? '#6B7280';

  return (
    <div
      className="border-l-4 border-[var(--store-color)] rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
      style={
        {
          '--store-color': storeColor,
          backgroundColor: `${storeColor}0D`,
        } as React.CSSProperties
      }
    >
      {/* Header: Name + Store Badge */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>
        </div>

        {/* Source Store */}
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[var(--store-color)] text-white px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
          <i className="fa-solid fa-location-dot text-[10px]"></i>
          {customer.sourceStore}
        </span>
      </div>

      {/* Product Details | Timeline */}
      <div className="space-y-2 sm:space-y-3">
        {/* Product Details */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
          <span className="font-stretch-50% text-gray-900">{customer.model}</span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className={`fa-solid fa-barcode text-[var(--store-color)] text-[10px]`}></i>
            {customer.reference}
          </span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className={`fa-solid fa-ruler text-[var(--store-color)] text-[10px]`}></i>
            Nº {customer.size}
          </span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className={`fa-solid fa-palette text-[var(--store-color)] text-[10px]`}></i>
            {customer.color}
          </span>
        </div>

        {/* Timeline  */}
        <div className="flex flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <i className={`fa-solid fa-clipboard-list text-[var(--store-color)]`}></i>
            {formatDate(customer.createdAt)}
          </span>

          {customer.contactedAt && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <i className={`fa-solid fa-location-dot text-[var(--store-color)]`}></i>
              {formatDate(customer.contactedAt)}
            </span>
          )}
          {customer.completedAt && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <i className={`fa-solid fa-circle-check text-[var(--store-color)]`}></i>
              {formatDate(customer.completedAt)}
            </span>
          )}
          {customer.contactedAt && customer.transferredAt && (
            <span className="text-xs px-2 py-1 rounded font-medium whitespace-nowrap">
              <i className="fa-solid fa-truck-fast text-[10px] pr-1"></i>
              {getDaysBetween(customer.transferredAt, customer.contactedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Salesperson */}
      <div
        className={`mt-2 pt-2 border-t border-[var(--store-color)] flex flex-row sm:items-center justify-between gap-2`}
      >
        {customer.salesperson && (
          <div className="inline-flex items-center gap-1.5 text-xs">
            <i className={`fa-solid fa-user text-[var(--store-color)]  text-[10px]`}></i>
            <span className="font-medium text-gray-700">{customer.salesperson}</span>
          </div>
        )}
        {/* Badge "Não vendido" (SÓ se arquivado) */}
        {customer.archived && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 sm:px-1 py-0.5 rounded-full whitespace-nowrap">
            <i className={`fa-solid fa-box-archive text-[var(--store-color)] text-[10px]`}></i>
            Não vendido
          </span>
        )}
      </div>
    </div>
  );
}

export default TransferCard;
