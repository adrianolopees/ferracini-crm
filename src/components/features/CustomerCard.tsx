import { Customer } from '@/types/customer';
import {
  formatDistanceToNow,
  formatDateTime,
  formatDaysElapsed,
} from '@/utils';
import { getCustomerStatus } from '@/utils/customerStatus';

interface CustomerCardProps {
  customer: Customer;
  variant?: 'default' | 'compact' | 'finalized';
  onWhatsApp?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onRestore?: (customer: Customer) => void;
  showActions?: boolean;

  // Dashboard-specific actions
  onCheckLojaCampinas?: (customer: Customer) => void;
  onCheckLojaDomPedro?: (customer: Customer) => void;
  onStoreHasStock?: (customer: Customer) => void;
  onStoreNoStock?: (customer: Customer) => void;
  onClientAccepted?: (customer: Customer) => void;
  onClientDeclined?: (customer: Customer) => void;
  onProductArrived?: (customer: Customer) => void;
  onPurchaseCompleted?: (customer: Customer) => void;
}

function CustomerCard({
  customer,
  variant = 'default',
  onWhatsApp,
  onDelete,
  onRestore,
  showActions = true,
  // Dashboard-specific actions
  onCheckLojaCampinas,
  onCheckLojaDomPedro,
  onStoreHasStock,
  onStoreNoStock,
  onClientAccepted,
  onClientDeclined,
  onProductArrived,
  onPurchaseCompleted,
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
      className={`${borderClass} rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200 relative`}
    >
      {/* Action Buttons - Canto superior direito */}
      {showActions && (
        <div className="absolute top-3 right-3 flex gap-2">
          {onRestore && isArchived && (
            <button
              onClick={() => onRestore(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Restaurar cliente"
            >
              <i className="fa-solid fa-arrow-rotate-left text-lg" />
            </button>
          )}
          {onDelete && !isFinalized && (
            <button
              onClick={() => onDelete(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Excluir cliente"
            >
              <i className="fa-regular fa-trash-can text-lg" />
            </button>
          )}
          {onWhatsApp && !isFinalized && (
            <button
              onClick={() => onWhatsApp(customer)}
              className="inline-flex items-center justify-center w-9 h-9 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer shadow-sm"
              title="Enviar WhatsApp"
            >
              <i className="fa-brands fa-whatsapp text-lg" />
            </button>
          )}
        </div>
      )}

      {/* Layout 2 Colunas: Cliente | Produto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* COLUNA ESQUERDA: Informações do Cliente */}
        <div className="space-y-2 pr-20 md:pr-0">
          {/* Nome e Status Badge */}
          <div className="flex items-center flex-wrap gap-2">
            <h3
              className={`font-semibold text-gray-900 ${variant === 'compact' ? 'text-base' : 'text-lg'}`}
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
            {customer.vendedor && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {customer.vendedor}
              </span>
            )}
          </div>

          {/* Data Info Contextual por Etapa */}
          {isFinalized && customer.dataFinalizacao ? (
            // FINALIZADO
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-check text-emerald-600 text-xs"></i>
                <span className="font-medium text-emerald-700">
                  {formatDateTime(customer.dataFinalizacao)}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-hourglass-end text-purple-600 text-xs"></i>
                <span className="text-purple-700">
                  {formatDaysElapsed(
                    customer.dataCriacao,
                    customer.dataFinalizacao
                  )}
                </span>
              </div>
              {customer.lojaOrigem && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-store text-blue-600 text-xs"></i>
                    <span className="text-blue-700">{customer.lojaOrigem}</span>
                  </div>
                </>
              )}
            </div>
          ) : isArchived && customer.dataArquivamento ? (
            // ARQUIVADO
            <div className="text-sm space-y-1">
              <span className="text-orange-600 font-medium">
                Arquivado {formatDistanceToNow(customer.dataArquivamento)}
              </span>
              {customer.motivoArquivamento && (
                <div className="text-gray-600">
                  Motivo:{' '}
                  <span className="font-medium">
                    {customer.motivoArquivamento}
                  </span>
                </div>
              )}
            </div>
          ) : customer.status === 'contactado' && customer.dataContacto ? (
            // PRONTO PARA RETIRADA
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-clock text-green-600 text-xs"></i>
                <span className="font-medium text-green-700 ">
                  Pronto há {formatDistanceToNow(customer.dataContacto)}
                </span>
              </div>
              {/* Badge Loja Origem */}
              {customer.lojaOrigem && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    <i className="fa-solid fa-store pr-1.5"></i>
                    {customer.lojaOrigem}
                  </span>
                </>
              )}
            </div>
          ) : customer.status === 'aguardando_transferencia' ? (
            // AGUARDANDO TRANSFERÊNCIA
            <div className="text-sm space-y-0.5">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-truck text-blue-600 text-xs"></i>
                <span className="font-medium text-blue-700">
                  Transferência de {customer.lojaOrigem || '...'}
                </span>
              </div>
              {customer.dataTransferencia && (
                <span className="text-xs text-gray-600 block ml-5">
                  Em trânsito há{' '}
                  {formatDistanceToNow(customer.dataTransferencia)}
                </span>
              )}
            </div>
          ) : (
            // AGUARDANDO (padrão)
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={status.textClass}>
                Aguardando há {formatDistanceToNow(customer.dataCriacao)}
              </span>
            </div>
          )}

          {/* Celular */}
          {showActions && (
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-phone text-gray-500 text-xs"></i>
              <span className="text-sm text-gray-600">{customer.celular}</span>
            </div>
          )}

          {/* Botões Contextuais do Dashboard */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {/* Status: AGUARDANDO - SUB-ESTADO 1: Inicial */}
            {(!customer.status || customer.status === 'aguardando') &&
              !customer.consultandoLoja &&
              !customer.lojaTemEstoque && (
                <>
                  {onCheckLojaCampinas && (
                    <button
                      onClick={() => onCheckLojaCampinas(customer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                      title="Consultar disponibilidade na Loja Campinas"
                    >
                      <i className="fa-solid fa-store"></i>
                      <span>Verificar Campinas</span>
                    </button>
                  )}

                  {onCheckLojaDomPedro && (
                    <button
                      onClick={() => onCheckLojaDomPedro(customer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors cursor-pointer"
                      title="Consultar disponibilidade na Loja Dom Pedro"
                    >
                      <i className="fa-solid fa-store"></i>
                      <span>Verificar Dom Pedro</span>
                    </button>
                  )}
                </>
              )}

            {/* Status: AGUARDANDO - SUB-ESTADO 2: Aguardando resposta da LOJA */}
            {(!customer.status || customer.status === 'aguardando') &&
              customer.consultandoLoja &&
              !customer.lojaTemEstoque && (
                <>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                    📞 Aguardando resposta - {customer.consultandoLoja}
                  </span>

                  {onStoreHasStock && (
                    <button
                      onClick={() => onStoreHasStock(customer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                      title="Loja confirmou que tem o produto"
                    >
                      <i className="fa-solid fa-check"></i>
                      <span>Tem Estoque</span>
                    </button>
                  )}

                  {onStoreNoStock && (
                    <button
                      onClick={() => onStoreNoStock(customer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                      title="Loja não tem o produto"
                    >
                      <i className="fa-solid fa-times"></i>
                      <span>Não Tem</span>
                    </button>
                  )}
                </>
              )}

            {/* Status: AGUARDANDO - SUB-ESTADO 3: Aguardando resposta do CLIENTE */}
            {(!customer.status || customer.status === 'aguardando') &&
              customer.consultandoLoja &&
              customer.lojaTemEstoque && (
                <>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                    💬 Cliente notificado - {customer.consultandoLoja}
                  </span>

                  {onClientAccepted && (
                    <button
                      onClick={() => onClientAccepted(customer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                      title="Cliente aceitou aguardar transferência"
                    >
                      <i className="fa-solid fa-check"></i>
                      <span>Cliente Aceitou</span>
                    </button>
                  )}

                  {onClientDeclined && (
                    <button
                      onClick={() => onClientDeclined(customer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                      title="Cliente recusou a transferência"
                    >
                      <i className="fa-solid fa-times"></i>
                      <span>Cliente Recusou</span>
                    </button>
                  )}
                </>
              )}

            {/* Status: AGUARDANDO TRANSFERÊNCIA - Botão de produto chegou */}
            {customer.status === 'aguardando_transferencia' &&
              onProductArrived && (
                <button
                  onClick={() => onProductArrived(customer)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                  title="Produto chegou"
                >
                  <i className="fa-solid fa-box"></i>
                  <span>Produto Chegou</span>
                </button>
              )}

            {/* Status: PRONTO PARA RETIRADA - Botão de compra concluída */}
            {customer.status === 'contactado' && onPurchaseCompleted && (
              <button
                onClick={() => onPurchaseCompleted(customer)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                title="Cliente comprou"
              >
                <i className="fa-solid fa-circle-check"></i>
                <span>Cliente Comprou</span>
              </button>
            )}

            {/* Status: FINALIZADO - Mostrar apenas info */}
            {customer.status === 'finalizado' && onPurchaseCompleted && (
              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                ✓ Venda Concluída
              </span>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Produto */}
        <div className="bg-gray-50/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-box text-gray-400 text-sm"></i>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Produto
            </span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div>
              <p className="font-bold text-gray-900 text-base">
                {customer.modelo}
              </p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">{customer.referencia}</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-gray-600">
                <span className="font-semibold">Nº</span> {customer.numeracao}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">
                <span className="font-semibold">Cor</span> {customer.cor}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerCard;
