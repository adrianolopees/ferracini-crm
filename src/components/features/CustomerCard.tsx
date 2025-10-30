import { Customer } from '@/types/customer';
import {
  formatDistanceToNow,
  formatDateTime,
  formatDaysElapsed,
} from '@/utils';
import { getCustomerStatus } from '@/utils/customerStatus';
import { Button } from '@/components/ui';

interface CustomerCardProps {
  customer: Customer;
  variant?: 'default' | 'compact' | 'finalized' | 'transfer';
  onSendMessage?: (customer: Customer) => void;
  onArchive?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onRestore?: (customer: Customer) => void;
  onResetToInitial?: (customer: Customer) => void;
  showActions?: boolean;

  checkStoreCampinas?: (customer: Customer) => void;
  checkStoreDomPedro?: (customer: Customer) => void;
  productArrived?: (customer: Customer) => void;
  completeOrder?: (customer: Customer) => void;
  confirmStoreStock?: (customer: Customer) => void;
  rejectStoreStock?: (customer: Customer) => void;
  acceptTransfer?: (customer: Customer) => void;
  declineTransfer?: (customer: Customer) => void;
}

function CustomerCard({
  customer,
  variant = 'default',
  onSendMessage,
  onArchive,
  onDelete,
  onRestore,
  onResetToInitial,
  showActions = true,

  checkStoreCampinas,
  checkStoreDomPedro,
  productArrived,
  completeOrder,
  confirmStoreStock,
  rejectStoreStock,
  acceptTransfer,
  declineTransfer,
}: CustomerCardProps) {
  const status = getCustomerStatus(customer.createdAt);
  const isFinalized = customer.status === 'completed';
  const isArchived = customer.archived;

  // Determinar classes baseadas no variant
  const borderClass = isFinalized
    ? 'border-l-emerald-500 bg-emerald-50/50'
    : isArchived
      ? 'border-l-orange-500 bg-orange-50'
      : status.borderClass + ' bg-gray-50';

  // Variant TRANSFER - Layout focado em relatório
  if (variant === 'transfer') {
    return (
      <div className="border-l-4 border-l-blue-500 bg-blue-50/30 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        {/* Header: Nome + Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base">{customer.name}</h3>
            {customer.salesperson && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {customer.salesperson}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
            <i className="fa-solid fa-arrows-turn-right"></i>
            Transferência
          </span>
        </div>

        {/* Grid: Produto | Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* COLUNA ESQUERDA: Produto */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-box text-blue-500 text-sm"></i>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Produto
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-gray-900">{customer.model}</p>
              <p className="text-gray-700">{customer.reference}</p>
              <div className="flex gap-3 text-xs text-gray-600">
                <span><span className="font-semibold">Nº</span> {customer.size}</span>
                <span className="text-gray-400">•</span>
                <span><span className="font-semibold">Cor</span> {customer.color}</span>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Timeline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-clock-rotate-left text-blue-500 text-sm"></i>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Linha do Tempo
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {/* Solicitado */}
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-circle text-gray-400 text-[6px] mt-1.5"></i>
                <div>
                  <span className="text-gray-600">Solicitado:</span>
                  <span className="font-medium text-gray-900 ml-1">{formatDateTime(customer.createdAt)}</span>
                </div>
              </div>

              {/* Chegou na loja */}
              {customer.contactedAt && (
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-circle text-blue-500 text-[6px] mt-1.5"></i>
                  <div>
                    <span className="text-gray-600">Chegou:</span>
                    <span className="font-medium text-gray-900 ml-1">{formatDateTime(customer.contactedAt)}</span>
                  </div>
                </div>
              )}

              {/* Vendido */}
              {customer.completedAt && (
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-circle text-emerald-500 text-[6px] mt-1.5"></i>
                  <div>
                    <span className="text-gray-600">Vendido:</span>
                    <span className="font-medium text-gray-900 ml-1">{formatDateTime(customer.completedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Origem + Tempo Total */}
        <div className="mt-4 pt-3 border-t border-blue-200 flex items-center justify-between flex-wrap gap-2">
          {/* Loja Origem */}
          <div className="inline-flex items-center gap-2 text-sm">
            <i className="fa-solid fa-store text-blue-600"></i>
            <span className="text-gray-600">Origem:</span>
            <span className="font-semibold text-blue-700">{customer.sourceStore || 'N/A'}</span>
          </div>

          {/* Tempo Total */}
          {customer.completedAt && (
            <div className="inline-flex items-center gap-2 text-sm">
              <i className="fa-solid fa-hourglass-end text-purple-600"></i>
              <span className="text-gray-600">Tempo total:</span>
              <span className="font-semibold text-purple-700">
                {formatDaysElapsed(customer.createdAt, customer.completedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${borderClass} rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200 relative`}
    >
      {/* Action Buttons - Canto superior direito */}
      {showActions && (
        <div className="absolute top-3 right-3 flex gap-2">
          {onResetToInitial &&
            !isFinalized &&
            !isArchived &&
            (customer.consultingStore ||
              customer.status === 'awaiting_transfer' ||
              customer.status === 'ready_for_pickup') && (
              <button
                onClick={() => onResetToInitial(customer)}
                className="inline-flex items-center justify-center w-9 h-9 text-orange-600 hover:bg-orange-50 rounded-lg
  transition-colors cursor-pointer shadow-sm"
                title="Resetar para estado inicial"
              >
                <i className="fa-solid fa-rotate-left text-lg" />
              </button>
            )}
          {onRestore && isArchived && (
            <button
              onClick={() => onRestore(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Restaurar cliente"
            >
              <i className="fa-solid fa-arrow-rotate-left text-lg" />
            </button>
          )}
          {onDelete && isArchived && (
            <button
              onClick={() => onDelete(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Excluir cliente permanentemente"
            >
              <i className="fa-solid fa-circle-xmark text-lg" />
            </button>
          )}
          {onArchive && !isFinalized && (
            <button
              onClick={() => onArchive(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Arquivar cliente"
            >
              <i className="fa-solid fa-box-archive text-lg" />
            </button>
          )}
          {onSendMessage && !isFinalized && (
            <button
              onClick={() => onSendMessage(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Enviar WhatsApp"
            >
              <i className="fa-brands fa-whatsapp text-lg text-green-600" />
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
              {customer.name}
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
            {customer.salesperson && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {customer.salesperson}
              </span>
            )}
          </div>

          {/* Data Info Contextual por Etapa */}
          {isFinalized && customer.completedAt ? (
            // FINALIZADO
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-check text-emerald-600 text-xs"></i>
                <span className="font-medium text-emerald-700">
                  {formatDateTime(customer.completedAt)}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-hourglass-end text-purple-600 text-xs"></i>
                <span className="text-purple-700">
                  {formatDaysElapsed(customer.createdAt, customer.completedAt)}
                </span>
              </div>
              {customer.sourceStore && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-store text-blue-600 text-xs"></i>
                    <span className="text-blue-700">
                      {customer.sourceStore}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : isArchived && customer.archivedAt ? (
            // ARQUIVADO
            <div className="text-sm space-y-1">
              <span className="text-orange-600 font-medium">
                Arquivado {formatDistanceToNow(customer.archivedAt)}
              </span>
              {customer.archiveReason && (
                <div className="text-gray-600">
                  Motivo:{' '}
                  <span className="font-medium">{customer.archiveReason}</span>
                </div>
              )}
            </div>
          ) : customer.status === 'ready_for_pickup' && customer.contactedAt ? (
            // PRONTO PARA RETIRADA
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-clock text-green-600 text-xs"></i>
                <span className="font-medium text-green-700 ">
                  Pronto há {formatDistanceToNow(customer.contactedAt)}
                </span>
              </div>
              {/* Badge Loja Origem */}
              {customer.sourceStore && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    <i className="fa-solid fa-store pr-1.5"></i>
                    {customer.sourceStore}
                  </span>
                </>
              )}
            </div>
          ) : customer.status === 'awaiting_transfer' ? (
            // AGUARDANDO TRANSFERÊNCIA
            <div className="text-sm space-y-0.5">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-truck text-blue-600 text-xs"></i>
                <span className="font-medium text-blue-700">
                  Transferência de {customer.sourceStore || '...'}
                </span>
              </div>
              {customer.transferredAt && (
                <span className="text-xs text-gray-600 block ml-5">
                  Em trânsito há {formatDistanceToNow(customer.transferredAt)}
                </span>
              )}
            </div>
          ) : (
            // AGUARDANDO (padrão)
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={status.textClass}>
                <i className="fa-solid fa-clock text-gray-500 text-xs pr-1.5"></i>
                Aguardando há {formatDistanceToNow(customer.createdAt)}
              </span>
            </div>
          )}

          {/* Celular */}
          {showActions && (
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-phone text-gray-500 text-xs"></i>
              <span className="text-sm text-gray-600">{customer.phone}</span>
            </div>
          )}

          {/* Botões Contextuais do Dashboard */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {/* Status: AGUARDANDO - SUB-ESTADO 1: Inicial */}
            {(!customer.status || customer.status === 'pending') &&
              !customer.consultingStore &&
              !customer.storeHasStock && (
                <>
                  {checkStoreCampinas && (
                    <Button
                      onClick={() => checkStoreCampinas(customer)}
                      variant="blue"
                      size="xs"
                      withRing={false}
                      title="Consultar disponibilidade no Campinas Shopping"
                    >
                      <i className="fa-solid fa-store pr-1.5"></i>
                      <span>Campinas</span>
                    </Button>
                  )}

                  {checkStoreDomPedro && (
                    <Button
                      onClick={() => checkStoreDomPedro(customer)}
                      variant="purple"
                      size="xs"
                      withRing={false}
                      title="Consultar disponibilidade no Dom Pedro"
                    >
                      <i className="fa-solid fa-store pr-1.5"></i>
                      <span>Dom Pedro</span>
                    </Button>
                  )}
                </>
              )}

            {/* Status: AGUARDANDO - SUB-ESTADO 2: Aguardando resposta da LOJA */}
            {(!customer.status || customer.status === 'pending') &&
              customer.consultingStore &&
              !customer.storeHasStock && (
                <>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                    📞 Aguardando resposta - {customer.consultingStore}
                  </span>

                  {confirmStoreStock && (
                    <Button
                      onClick={() => confirmStoreStock(customer)}
                      variant="green"
                      size="xs"
                      withRing={false}
                      title="Loja tem o produto"
                    >
                      <i className="fa-solid fa-check pr-1.5"></i>
                      <span>Disponível</span>
                    </Button>
                  )}

                  {rejectStoreStock && (
                    <Button
                      onClick={() => rejectStoreStock(customer)}
                      variant="red"
                      size="xs"
                      withRing={false}
                      title="Loja não tem o produto"
                    >
                      <i className="fa-solid fa-times pr-1.5"></i>
                      <span>Indisponível</span>
                    </Button>
                  )}
                </>
              )}

            {/* Status: AGUARDANDO - SUB-ESTADO 3: Aguardando resposta do CLIENTE */}
            {(!customer.status || customer.status === 'pending') &&
              customer.consultingStore &&
              customer.storeHasStock && (
                <>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                    💬 Cliente notificado - {customer.consultingStore}
                  </span>

                  {acceptTransfer && (
                    <Button
                      onClick={() => acceptTransfer(customer)}
                      variant="emerald"
                      size="xs"
                      withRing={false}
                      title="Cliente aceitou a transferência"
                    >
                      <i className="fa-solid fa-check pr-1.5"></i>
                      <span>Cliente Aceitou</span>
                    </Button>
                  )}

                  {declineTransfer && (
                    <Button
                      onClick={() => declineTransfer(customer)}
                      variant="red"
                      size="xs"
                      withRing={false}
                      title="Cliente recusou a transferência"
                    >
                      <i className="fa-solid fa-times pr-1.5"></i>
                      <span>Cliente Recusou</span>
                    </Button>
                  )}
                </>
              )}

            {/* Status: AGUARDANDO TRANSFERÊNCIA - Botão de produto chegou */}
            {customer.status === 'awaiting_transfer' && productArrived && (
              <button
                onClick={() => productArrived(customer)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                title="Produto chegou"
              >
                <i className="fa-solid fa-box"></i>
                <span>Produto Chegou</span>
              </button>
            )}

            {/* Status: PRONTO PARA RETIRADA - Botão de compra concluída */}
            {customer.status === 'ready_for_pickup' && completeOrder && (
              <button
                onClick={() => completeOrder(customer)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                title="Cliente comprou"
              >
                <i className="fa-solid fa-circle-check"></i>
                <span>Cliente Comprou</span>
              </button>
            )}

            {/* Status: FINALIZADO - Mostrar apenas info */}
            {customer.status === 'completed' && completeOrder && (
              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                ✓ Venda Concluída
              </span>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Produto */}
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

export default CustomerCard;
