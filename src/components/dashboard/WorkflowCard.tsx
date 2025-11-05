/**
 * WorkflowCard Component
 *
 * Card usado no Dashboard e na página de Buscar Clientes
 * Exibe informações completas do cliente e todas as ações do workflow
 *
 * Estados do workflow:
 * 1. PENDING (inicial) -> escolher loja
 * 2. PENDING (consultando) -> aguardar resposta da loja
 * 3. PENDING (disponível) -> aguardar resposta do cliente
 * 4. AWAITING_TRANSFER -> produto em trânsito
 * 5. READY_FOR_PICKUP -> produto disponível para retirada
 *
 * @module components/features/WorkflowCard
 */

import { Customer } from '@/types/customer';
import { getTimeAgo } from '@/utils';
import { getCustomerStatus } from '@/utils/customerStatus';
import { Button } from '@/components/ui';

/* ============================================================================
 * TYPES
 * ========================================================================= */

interface WorkflowCardProps {
  customer: Customer;
  showActions?: boolean;

  // Generic actions
  onSendMessage?: (customer: Customer) => void;
  onArchive?: (customer: Customer) => void;
  onResetToInitial?: (customer: Customer) => void;

  // Workflow actions
  checkStoreCampinas?: (customer: Customer) => void;
  checkStoreDomPedro?: (customer: Customer) => void;
  productArrived?: (customer: Customer) => void;
  completeOrder?: (customer: Customer) => void;
  confirmStoreStock?: (customer: Customer) => void;
  rejectStoreStock?: (customer: Customer) => void;
  acceptTransfer?: (customer: Customer) => void;
  declineTransfer?: (customer: Customer) => void;
}

/* ============================================================================
 * COMPONENT
 * ========================================================================= */

function WorkflowCard({
  customer,
  showActions = true,
  onSendMessage,
  onArchive,
  onResetToInitial,
  checkStoreCampinas,
  checkStoreDomPedro,
  productArrived,
  completeOrder,
  confirmStoreStock,
  rejectStoreStock,
  acceptTransfer,
  declineTransfer,
}: WorkflowCardProps) {
  // Compute customer state
  const status = getCustomerStatus(customer.createdAt);

  // Determine border styling based on state
  const borderClass = status.borderClass + ' bg-gray-50';

  return (
    <div
      className={`${borderClass} rounded-lg p-3 sm:p-4 border-l-4 hover:shadow-md transition-shadow duration-200 relative`}
    >
      {/* Top-Right Action Buttons - Hidden on mobile, visible on md+ */}
      {showActions && (
        <div className="hidden md:flex absolute top-3 right-3 flex-col gap-2">
          {/* Reset to Initial State */}
          {onResetToInitial &&
            (customer.consultingStore ||
              customer.status === 'awaiting_transfer' ||
              customer.status === 'ready_for_pickup') && (
              <button
                onClick={() => onResetToInitial(customer)}
                className="inline-flex items-center justify-center w-9 h-9 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer shadow-sm"
                title="Resetar para estado inicial"
              >
                <i className="fa-solid fa-rotate-left text-lg" />
              </button>
            )}

          {/* Archive Active */}
          {onArchive && (
            <button
              onClick={() => onArchive(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Arquivar cliente"
            >
              <i className="fa-solid fa-box-archive text-lg" />
            </button>
          )}

          {/* Send WhatsApp Message */}
          {onSendMessage && (
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

      {/* Header: Name + Badges */}
      <div className="flex items-start justify-between mb-1 gap-2 md:pr-20">
        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
            {customer.name}
          </h3>

          {customer.salesperson && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
              <i className="fa-solid fa-user text-[10px]"></i>
              {customer.salesperson}
            </span>
          )}
        </div>
      </div>

      {/* Timeline & Product Info */}
      <div className="space-y-2 sm:space-y-3">
        {/* Timeline based on status - inline with phone on desktop, separate on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs sm:text-sm sm:flex-wrap">
          {customer.status === 'ready_for_pickup' && customer.contactedAt ? (
            // Stage: READY FOR PICKUP
            <div
              className={`flex items-center gap-1.5 flex-wrap ${status.textClass}`}
            >
              <i
                className={`fa-solid fa-clock ${status.iconClass} text-[10px]`}
              ></i>
              <span>Pronto há:</span>
              <span>{getTimeAgo(customer.contactedAt)}</span>
              {customer.sourceStore && (
                <>
                  <span className="text-gray-400 mx-1">•</span>
                  <i
                    className={`fa-solid fa-store ${status.iconClass} text-[10px]`}
                  ></i>
                  <span>{customer.sourceStore}</span>
                </>
              )}
            </div>
          ) : customer.status === 'awaiting_transfer' ? (
            // Stage: AWAITING TRANSFER
            <div
              className={`flex items-center gap-1.5 flex-wrap ${status.textClass}`}
            >
              <i
                className={`fa-solid fa-truck ${status.iconClass} text-[10px]`}
              ></i>
              <span>Transferência:</span>
              <span>{customer.sourceStore || '...'}</span>
              {customer.transferredAt && (
                <>
                  <span className="text-gray-400 mx-1">•</span>
                  <i
                    className={`fa-solid fa-clock ${status.iconClass} text-[10px]`}
                  ></i>
                  <span>{getTimeAgo(customer.transferredAt)}</span>
                </>
              )}
            </div>
          ) : (
            // Stage: PENDING (default)
            <div
              className={`flex items-center gap-1.5 flex-wrap ${status.textClass}`}
            >
              <i
                className={`fa-solid fa-clock ${status.iconClass} text-[10px]`}
              ></i>
              <span>Aguardando há:</span>
              <span>{getTimeAgo(customer.createdAt)}</span>
            </div>
          )}

          {/* Phone Number - inline on desktop (sm+), separate line on mobile */}
          {showActions && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="hidden sm:inline text-gray-400 mx-1">•</span>
              <i className="fa-solid fa-phone text-[10px]"></i>
              <span>{customer.phone}</span>
            </div>
          )}
        </div>

        {/* Product Details - inline on desktop, name highlighted + details below on mobile */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
          <span className="font-medium text-gray-900">{customer.model}</span>
          <span className="text-gray-400">•</span>
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

        {/* Product - mobile only (name highlighted, details below) */}
        <div className="sm:hidden space-y-2">
          <div className="text-sm font-medium text-gray-900">
            {customer.model}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
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
        </div>
      </div>

      {/* Workflow Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap mt-3">
        {/* STATE 1: Initial - Choose Store */}
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

        {/* STATE 2: Waiting for Store Response */}
        {(!customer.status || customer.status === 'pending') &&
          customer.consultingStore &&
          !customer.storeHasStock && (
            <>
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                <i className="fa-solid fa-phone text-[10px]"></i>
                <span className="hidden sm:inline">Aguardando resposta -</span>
                <span className="sm:hidden">Aguardando</span>
                {customer.consultingStore}
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

        {/* STATE 3: Waiting for Customer Response */}
        {(!customer.status || customer.status === 'pending') &&
          customer.consultingStore &&
          customer.storeHasStock && (
            <>
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                <i className="fa-solid fa-comment text-[10px]"></i>
                <span className="hidden sm:inline">Cliente notificado -</span>
                <span className="sm:hidden">Notificado</span>
                {customer.consultingStore}
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

        {/* STATE 4: Awaiting Transfer - Product Arrived */}
        {customer.status === 'awaiting_transfer' && productArrived && (
          <button
            onClick={() => productArrived(customer)}
            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 bg-green-500 text-white text-xs sm:text-sm rounded-lg hover:bg-green-600 transition-colors cursor-pointer shadow-sm"
            title="Produto chegou"
          >
            <i className="fa-solid fa-box text-sm sm:text-xs"></i>
            <span className="font-medium">Produto Chegou</span>
          </button>
        )}

        {/* STATE 5: Ready for Pickup - Complete Order */}
        {customer.status === 'ready_for_pickup' && completeOrder && (
          <button
            onClick={() => completeOrder(customer)}
            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 bg-emerald-500 text-white text-xs sm:text-sm rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer shadow-sm"
            title="Cliente comprou"
          >
            <i className="fa-solid fa-circle-check text-sm sm:text-xs"></i>
            <span className="font-medium">Cliente Comprou</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default WorkflowCard;
