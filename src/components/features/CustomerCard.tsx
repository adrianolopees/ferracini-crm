import { Customer } from '@/types/customer';
import { formatDistanceToNow, formatDateTime, formatDaysElapsed } from '@/utils';
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
      className={`${borderClass} rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
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

          {/* Data Info Contextual por Etapa */}
          {isFinalized && customer.dataFinalizacao ? (
            // FINALIZADO - Layout compacto e horizontal em desktop
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 mb-2">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-check text-emerald-600 text-sm"></i>
                <span className="text-sm font-medium text-emerald-700">
                  {formatDateTime(customer.dataFinalizacao)}
                </span>
              </div>
              <span className="hidden sm:inline text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-hourglass-end text-purple-600 text-sm"></i>
                <span className="text-sm text-purple-700">
                  {formatDaysElapsed(customer.dataCriacao, customer.dataFinalizacao)}
                </span>
              </div>
              {customer.lojaOrigem && (
                <>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-store text-blue-600 text-sm"></i>
                    <span className="text-sm text-blue-700">
                      {customer.lojaOrigem}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : isArchived && customer.dataArquivamento ? (
            // ARQUIVADO (mantém atual)
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
          ) : customer.status === 'contactado' && customer.dataContacto ? (
            // PRONTO PARA RETIRADA - Layout horizontal
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-box-open text-green-600 text-sm"></i>
                <span className="text-sm font-medium text-green-700">
                  Pronto há {formatDistanceToNow(customer.dataContacto)}
                </span>
              </div>
              {customer.lojaOrigem && (
                <>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    🏪 {customer.lojaOrigem}
                  </span>
                </>
              )}
            </div>
          ) : customer.status === 'aguardando_transferencia' ? (
            // AGUARDANDO TRANSFERÊNCIA - Compacto
            <div className="space-y-0.5 mb-2">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-truck text-blue-600 text-sm"></i>
                <span className="text-sm font-medium text-blue-700">
                  Transferência de {customer.lojaOrigem || '...'}
                </span>
              </div>
              {customer.dataTransferencia && (
                <span className="text-xs text-gray-600 block ml-5">
                  Em trânsito há {formatDistanceToNow(customer.dataTransferencia)}
                </span>
              )}
            </div>
          ) : (
            // AGUARDANDO (padrão) - Compacto
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-sm ${status.textClass}`}>
                Aguardando há {formatDistanceToNow(customer.dataCriacao)}
              </span>
              {customer.consultandoLoja && (
                <>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                    🔍 {customer.consultandoLoja}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Celular/WhatsApp */}
          {showActions && (
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-phone text-gray-500 text-sm"></i>
              <span className="text-sm sm:text-base text-gray-600">
                {customer.celular}
              </span>
              {/* WhatsApp - NÃO mostrar em finalizado */}
              {onWhatsApp && !isFinalized && (
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

      {/* Product Details - Grid Compacto */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <span className="text-gray-500 text-xs">Modelo:</span>
          <p className="font-semibold text-gray-900">{customer.modelo}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Referência:</span>
          <p className="font-semibold text-gray-900">{customer.referencia}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Numeração:</span>
          <p className="font-semibold text-gray-900">{customer.numeracao}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Cor:</span>
          <p className="font-semibold text-gray-900">{customer.cor}</p>
        </div>
      </div>
    </div>
  );
}

export default CustomerCard;
