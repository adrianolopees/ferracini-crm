import { Customer } from '@/types/customer';
import { formatDistanceToNow } from '@/utils';
import { getCustomerStatus } from '@/utils/customerStatus';

interface CustomerCardProps {
  customer: Customer;
  variant?: 'default' | 'compact' | 'finalized';
  onWhatsApp?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onRestore?: (customer: Customer) => void;
  showActions?: boolean;
}

function CustomerCard({
  customer,
  variant = 'default',
  onWhatsApp,
  onDelete,
  onRestore,
  showActions = true,
}: CustomerCardProps) {
  const status = getCustomerStatus(customer.dataCriacao);
  const isFinalized = customer.status === 'finalizado';
  const isArchived = customer.arquivado;

  // Determinar classes baseadas no variant
  const borderClass = isFinalized
    ? 'border-l-emerald-500 bg-emerald-50/50'
    : isArchived
      ? 'border-l-orange-500 bg-orange-50'
      : status.borderClass + ' bg-gray-50';

  return (
    <div
      className={`${borderClass} rounded-lg p-5 border-l-4 hover:shadow-md transition-shadow duration-200`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {/* Nome e Status Badge */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold text-gray-900 ${variant === 'compact' ? 'text-base' : 'text-lg sm:text-xl'}`}
              >
                {customer.cliente}
              </h3>
              {isFinalized ? (
                <i
                  className="fa-solid fa-circle-check text-emerald-600"
                  title="Venda Concluída"
                />
              ) : (
                <span
                  className={`inline-block w-2 h-2 rounded-full ${status.dotClass}`}
                  title={status.label}
                />
              )}
            </div>
            {customer.vendedor && (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {customer.vendedor}
              </span>
            )}
          </div>

          {/* Data Info */}
          {isFinalized && customer.dataFinalizacao ? (
            <span className="text-sm block mb-2 text-emerald-600 font-medium">
              Finalizada em{' '}
              {new Date(customer.dataFinalizacao).toLocaleDateString('pt-BR')}
            </span>
          ) : isArchived && customer.dataArquivamento ? (
            <>
              <span className="text-sm block mb-1 text-orange-600 font-medium">
                Arquivado {formatDistanceToNow(customer.dataArquivamento)}
              </span>
              {customer.motivoArquivamento && (
                <span className="text-sm text-gray-600">
                  Motivo:{' '}
                  <span className="font-medium">
                    {customer.motivoArquivamento}
                  </span>
                </span>
              )}
            </>
          ) : (
            <span className={`text-sm block mb-2 ${status.textClass}`}>
              Aguardando há {formatDistanceToNow(customer.dataCriacao)}
            </span>
          )}

          {/* WhatsApp */}
          {showActions && (
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base text-gray-600">
                {customer.celular}
              </span>
              {onWhatsApp && (
                <button
                  onClick={() => onWhatsApp(customer)}
                  className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors cursor-pointer"
                  title="Enviar WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp text-lg" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            {onRestore && isArchived && (
              <button
                onClick={() => onRestore(customer)}
                className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Restaurar cliente"
              >
                <i className="fa-solid fa-arrow-rotate-left text-lg" />
              </button>
            )}
            {onDelete && !isFinalized && (
              <button
                onClick={() => onDelete(customer)}
                className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Excluir cliente"
              >
                <i className="fa-regular fa-trash-can text-lg" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-4 text-base">
        <div>
          <span className="text-gray-500 text-sm">Modelo:</span>
          <p className="font-semibold text-gray-900">{customer.modelo}</p>
        </div>
        <div>
          <span className="text-gray-500 text-sm">Referência:</span>
          <p className="font-semibold text-gray-900">{customer.referencia}</p>
        </div>
        <div>
          <span className="text-gray-500 text-sm">Numeração:</span>
          <p className="font-semibold text-gray-900">{customer.numeracao}</p>
        </div>
        <div>
          <span className="text-gray-500 text-sm">Cor:</span>
          <p className="font-semibold text-gray-900">{customer.cor}</p>
        </div>
      </div>
    </div>
  );
}

export default CustomerCard;
