import { DialogModal, Tabs } from '@/components/ui';
import { Customer } from '@/types/customer';
import { AnimatedListItem } from '@/components/animations';
import CustomerCard from './CustomerCard';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface CustomerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  customers: Customer[];
  loading: boolean;
  onWhatsApp: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onCheckLojaCampinas?: (customer: Customer) => void;
  onCheckLojaDomPedro?: (customer: Customer) => void;
  onProductArrived?: (customer: Customer) => void;
  onPurchaseCompleted?: (customer: Customer) => void;
  // Novos handlers para sub-estados
  onStoreHasStock?: (customer: Customer) => void;
  onStoreNoStock?: (customer: Customer) => void;
  onClientAccepted?: (customer: Customer) => void;
  onClientDeclined?: (customer: Customer) => void;
  // Props opcionais para tabs
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

function CustomerListModal({
  isOpen,
  onClose,
  title,
  customers,
  loading,
  onWhatsApp,
  onDelete,
  onCheckLojaCampinas,
  onCheckLojaDomPedro,
  onProductArrived,
  onPurchaseCompleted,
  onStoreHasStock,
  onStoreNoStock,
  onClientAccepted,
  onClientDeclined,
  tabs,
  activeTab,
  onTabChange,
}: CustomerListModalProps) {
  const content = (
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
          <p className="text-gray-600 font-medium">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <AnimatedListItem key={customer.id} index={index}>
              <CustomerCard
                customer={customer}
                variant="compact"
                onWhatsApp={onWhatsApp}
                onDelete={onDelete}
                onCheckLojaCampinas={onCheckLojaCampinas}
                onCheckLojaDomPedro={onCheckLojaDomPedro}
                onStoreHasStock={onStoreHasStock}
                onStoreNoStock={onStoreNoStock}
                onClientAccepted={onClientAccepted}
                onClientDeclined={onClientDeclined}
                onProductArrived={onProductArrived}
                onPurchaseCompleted={onPurchaseCompleted}
              />
            </AnimatedListItem>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DialogModal isOpen={isOpen} onClose={onClose} title={title}>
      {tabs && activeTab && onTabChange ? (
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}>
          {content}
        </Tabs>
      ) : (
        content
      )}
    </DialogModal>
  );
}

export default CustomerListModal;
