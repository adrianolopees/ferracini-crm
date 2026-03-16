import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Customer } from '@/schemas/customerSchema';
import { Store } from '@/schemas/storeSettingsSchema';
import { getTimeAgo, getDaysWaiting } from '@/utils';
import { getCustomerStatus } from '@/utils';
import { Button } from '@/components/ui';

interface WorkflowCardProps {
  customer: Customer;
  showActions?: boolean;
  isHighlighted?: boolean;

  transferStores?: Store[];
  onCheckStore?: (customer: Customer, store: Store) => void;

  onSendMessage?: (customer: Customer) => void;
  onArchive?: (customer: Customer) => void;
  onResetToInitial?: (customer: Customer) => void;

  productArrived?: (customer: Customer) => void;
  completeOrder?: (customer: Customer) => void;
  confirmStoreStock?: (customer: Customer) => void;
  rejectStoreStock?: (customer: Customer) => void;
  acceptTransfer?: (customer: Customer) => void;
  declineTransfer?: (customer: Customer) => void;
}

function WorkflowCard({
  customer,
  showActions = true,
  isHighlighted = false,
  transferStores = [],
  onCheckStore,
  onSendMessage,
  onArchive,
  onResetToInitial,
  productArrived,
  completeOrder,
  confirmStoreStock,
  rejectStoreStock,
  acceptTransfer,
  declineTransfer,
}: WorkflowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [isHighlighted]);

  const status = getCustomerStatus(customer.createdAt, customer.status);
  const borderClass = status.borderClass + ' bg-gray-50';

  const totalDaysWaiting = getDaysWaiting(customer.createdAt);
  const daysReadyForPickup = customer.contactedAt ? getDaysWaiting(customer.contactedAt) : 0;
  const pickupUrgent = customer.status === 'readyForPickup' && daysReadyForPickup >= 3;

  const canReset =
    onResetToInitial &&
    (customer.consultingStore ||
      customer.status === 'awaitingTransfer' ||
      customer.status === 'readyForPickup');

  return (
    <motion.div
      ref={cardRef}
      animate={{
        backgroundColor: isHighlighted ? '#dbeafe' : '#f9fafb',
      }}
      transition={{ duration: 0.3 }}
      className={`${borderClass} rounded-lg p-3 sm:p-4 border-l-4 hover:shadow-md transition-shadow duration-200 relative`}
    >
      {/* Top-Right Action Buttons — desktop only */}
      {showActions && (
        <div className="hidden md:flex absolute top-3 right-3 flex-col gap-2">
          {canReset && (
            <button
              onClick={() => onResetToInitial!(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Resetar para estado inicial"
            >
              <i className="fa-solid fa-rotate-left text-lg" />
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => onArchive(customer)}
              className="inline-flex items-center justify-center w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Arquivar cliente"
            >
              <i className="fa-solid fa-box-archive text-lg" />
            </button>
          )}
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
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>
          {customer.status === 'pending' && status.daysWaiting >= 14 && (
            <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium whitespace-nowrap">
              <i className="fa-solid fa-exclamation-triangle text-[10px]"></i>
              <span>{status.daysWaiting} dias!</span>
            </span>
          )}
          {customer.salesperson && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
              <i className="fa-solid fa-user text-[10px]"></i>
              {customer.salesperson}
            </span>
          )}
        </div>
      </div>

      {/* Timeline & Status */}
      <div className="space-y-1.5 sm:space-y-2 mt-2">
        {customer.status === 'readyForPickup' && customer.contactedAt ? (
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
            <i className={`fa-solid fa-check-circle text-xs ${pickupUrgent ? 'text-amber-500' : 'text-gray-500'}`}></i>
            <span className={pickupUrgent ? 'text-amber-600' : 'text-gray-600'}>Pronto há</span>
            <span className={`font-bold text-sm sm:text-base ${pickupUrgent ? 'text-amber-700' : 'text-gray-900'}`}>
              {getTimeAgo(customer.contactedAt)}
            </span>
            {pickupUrgent && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap border border-amber-200">
                <i className="fa-solid fa-bell text-[10px]"></i>
                aguardando retirada
              </span>
            )}
            {customer.sourceStore && (
              <>
                <span className="text-gray-400 mx-1">•</span>
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-store text-gray-500 text-xs"></i>
                  <span className="text-gray-600">{customer.sourceStore}</span>
                </div>
              </>
            )}
          </div>
        ) : customer.status === 'awaitingTransfer' ? (
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
            <i className="fa-solid fa-truck-fast text-gray-500 text-xs"></i>
            <span className="text-gray-600">Transferência:</span>
            <span className="text-gray-900 font-bold text-sm sm:text-base uppercase">{customer.sourceStore}</span>
            {customer.transferredAt && (
              <>
                <span className="text-gray-400 mx-1">•</span>
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-clock text-gray-500 text-xs"></i>
                  <span className="text-gray-600">há {getTimeAgo(customer.transferredAt)}</span>
                </div>
              </>
            )}
            {totalDaysWaiting > 1 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                <i className="fa-solid fa-hourglass-half text-[10px]"></i>
                {totalDaysWaiting} dias no total
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
            <i className="fa-solid fa-clock text-gray-500 text-xs"></i>
            <span className="text-gray-600">Aguardando há</span>
            <span className="text-gray-900 font-bold text-sm sm:text-base">{getTimeAgo(customer.createdAt)}</span>
          </div>
        )}

        {/* Phone */}
        {showActions && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <i className="fa-solid fa-phone text-[10px]"></i>
            <span>{customer.phone}</span>
          </div>
        )}

        {/* Product Details */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
          <span className="font-medium text-gray-900">{customer.model}</span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-barcode text-xs"></i>
            {customer.reference}
          </span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-ruler text-xs"></i>
            Nº {customer.size}
          </span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-palette text-xs"></i>
            {customer.color}
          </span>
        </div>
      </div>

      {/* Workflow Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap mt-3">
        {/* STATE 1: Initial - Choose Store */}
        {(!customer.status || customer.status === 'pending') &&
          !customer.consultingStore &&
          !customer.storeHasStock &&
          onCheckStore &&
          transferStores.map((store) => (
            <Button
              key={store.id}
              onClick={() => onCheckStore(customer, store)}
              size="xs"
              withRing={false}
              title={`Consultar disponibilidade em ${store.name}`}
              style={{ backgroundColor: store.color }}
              className="text-white hover:opacity-90"
            >
              <i className="fa-solid fa-store pr-1.5"></i>
              <span>{store.name}</span>
            </Button>
          ))}

        {/* STATE 2: Waiting for Store Response */}
        {(!customer.status || customer.status === 'pending') && customer.consultingStore && !customer.storeHasStock && (
          <>
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
              <i className="fa-solid fa-phone text-[10px]"></i>
              <span className="hidden sm:inline">Aguardando resposta -</span>
              <span className="sm:hidden">Aguardando</span>
              {customer.consultingStore}
            </span>
            {confirmStoreStock && (
              <Button onClick={() => confirmStoreStock(customer)} variant="green" size="xs" withRing={false} title="Loja tem o produto">
                <i className="fa-solid fa-check pr-1.5"></i>
                <span>Disponível</span>
              </Button>
            )}
            {rejectStoreStock && (
              <Button onClick={() => rejectStoreStock(customer)} variant="red" size="xs" withRing={false} title="Loja não tem o produto">
                <i className="fa-solid fa-times pr-1.5"></i>
                <span>Indisponível</span>
              </Button>
            )}
          </>
        )}

        {/* STATE 3: Waiting for Customer Response */}
        {(!customer.status || customer.status === 'pending') && customer.consultingStore && customer.storeHasStock && (
          <>
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
              <i className="fa-solid fa-comment text-[10px]"></i>
              <span className="hidden sm:inline">Cliente notificado -</span>
              <span className="sm:hidden">Notificado</span>
              {customer.consultingStore}
            </span>
            {acceptTransfer && (
              <Button onClick={() => acceptTransfer(customer)} variant="emerald" size="xs" withRing={false} title="Cliente aceitou a transferência">
                <i className="fa-solid fa-check pr-1.5"></i>
                <span>Cliente Aceitou</span>
              </Button>
            )}
            {declineTransfer && (
              <Button onClick={() => declineTransfer(customer)} variant="red" size="xs" withRing={false} title="Cliente recusou a transferência">
                <i className="fa-solid fa-times pr-1.5"></i>
                <span>Cliente Recusou</span>
              </Button>
            )}
          </>
        )}

        {/* STATE 4: Awaiting Transfer - Product Arrived */}
        {customer.status === 'awaitingTransfer' && productArrived && (
          <Button onClick={() => productArrived(customer)} variant="green" size="xs" withRing={false} title="Produto chegou">
            <i className="fa-solid fa-box pr-1.5"></i>
            <span>Produto Chegou</span>
          </Button>
        )}

        {/* STATE 5: Ready for Pickup - Complete Order */}
        {customer.status === 'readyForPickup' && completeOrder && (
          <Button onClick={() => completeOrder(customer)} variant="emerald" size="xs" withRing={false} title="Cliente comprou">
            <i className="fa-solid fa-circle-check pr-1.5"></i>
            <span>Cliente Comprou</span>
          </Button>
        )}
      </div>

      {/* Mobile Management Actions — visible only on mobile */}
      {showActions && (
        <div className="flex md:hidden items-center gap-2 mt-3 pt-3 border-t border-gray-200 flex-wrap">
          {onSendMessage && (
            <button
              onClick={() => onSendMessage(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-full transition-colors cursor-pointer"
              title="Enviar WhatsApp"
            >
              <i className="fa-brands fa-whatsapp text-[10px]"></i>
              <span>WhatsApp</span>
            </button>
          )}
          {canReset && (
            <button
              onClick={() => onResetToInitial!(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-full transition-colors cursor-pointer"
              title="Resetar para estado inicial"
            >
              <i className="fa-solid fa-rotate-left text-[10px]"></i>
              <span>Resetar</span>
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => onArchive(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-colors cursor-pointer"
              title="Arquivar cliente"
            >
              <i className="fa-solid fa-box-archive text-[10px]"></i>
              <span>Arquivar</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default WorkflowCard;
