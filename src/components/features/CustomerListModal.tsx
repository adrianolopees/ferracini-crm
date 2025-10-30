import { DialogModal } from '@/components/ui';
import { Customer } from '@/types/customer';
import { AnimatedListItem } from '@/components/animations';
import CustomerCard from './CustomerCard';

interface CustomerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  customers: Customer[];
  loading: boolean;
  onSendMessage: (customer: Customer) => void;
  onArchive: (customer: Customer) => void;
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
  onArchive,
  onSendMessage,
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
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-spinner fa-spin text-blue-500 text-3xl"></i>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <i className="fa-solid fa-inbox text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-600 font-medium">
              Nenhum cliente encontrado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer, index) => (
              <AnimatedListItem key={customer.id} index={index}>
                <CustomerCard
                  customer={customer}
                  variant="compact"
                  onSendMessage={onSendMessage}
                  onArchive={onArchive}
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
