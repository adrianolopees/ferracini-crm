import { DialogModal } from '@/components/modals';
import { Customer } from '@/schemas/customerSchema';
import { AnimatedListItem } from '@/components/animations';
import { WorkflowCard } from '@/components/dashboard';
import { WorkflowSkeleton } from '../skeletons';

interface CustomerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  customers: Customer[];
  loading: boolean;
  highlightedCustomerId?: string | null;
  onSendMessage: (customer: Customer) => void;
  onArchive: (customer: Customer) => void;
  onResetToInitial?: (customer: Customer) => void;
  checkStoreCampinas?: (customer: Customer) => void;
  checkStoreDomPedro?: (customer: Customer) => void;
  productArrived?: (customer: Customer) => void;
  completeOrder?: (customer: Customer) => void;
  confirmStoreStock?: (customer: Customer) => void;
  rejectStoreStock?: (customer: Customer) => void;
  acceptTransfer?: (customer: Customer) => void;
  declineTransfer?: (customer: Customer) => void;
}

function CustomerListModal({
  isOpen,
  onClose,
  title,
  customers,
  loading,
  highlightedCustomerId,
  onArchive,
  onSendMessage,
  onResetToInitial,
  checkStoreCampinas,
  checkStoreDomPedro,
  productArrived,
  completeOrder,
  confirmStoreStock,
  rejectStoreStock,
  acceptTransfer,
  declineTransfer,
}: CustomerListModalProps) {
  return (
    <DialogModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <WorkflowSkeleton key={i} />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <i className="fa-solid fa-inbox text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-600 font-medium">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer, index) => (
              <AnimatedListItem key={customer.id} index={index}>
                <WorkflowCard
                  customer={customer}
                  isHighlighted={highlightedCustomerId === customer.id}
                  onSendMessage={onSendMessage}
                  onArchive={onArchive}
                  onResetToInitial={onResetToInitial}
                  checkStoreCampinas={checkStoreCampinas}
                  checkStoreDomPedro={checkStoreDomPedro}
                  confirmStoreStock={confirmStoreStock}
                  rejectStoreStock={rejectStoreStock}
                  acceptTransfer={acceptTransfer}
                  declineTransfer={declineTransfer}
                  productArrived={productArrived}
                  completeOrder={completeOrder}
                />
              </AnimatedListItem>
            ))}
          </div>
        )}
      </div>
    </DialogModal>
  );
}

export default CustomerListModal;
