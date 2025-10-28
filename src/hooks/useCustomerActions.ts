import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer, ArchiveReason } from '@/types/customer';
import {
  notifyOtherStore,
  sendStoreCampinas,
  sendStoreDomPedro,
} from '@/services/whatsappService';
import {
  moveToAwaitingTransfer,
  markAsContacted,
  moveToFinished,
} from '@/services/customerStatusService';

function useCustomerActions() {
  const checkStoreCampinas = async (customer: Customer) => {
    await updateDoc(doc(db, 'customers', customer.id), {
      consultingStore: 'Campinas',
    });
    sendStoreCampinas(customer);
  };

  const checkStoreDomPedro = async (customer: Customer) => {
    await updateDoc(doc(db, 'customers', customer.id), {
      consultingStore: 'Dom Pedro',
    });
    sendStoreDomPedro(customer);
  };

  const confirmStoreStock = async (customer: Customer) => {
    await updateDoc(doc(db, 'customers', customer.id), {
      storeHasStock: true,
    });
    notifyOtherStore(customer);
  };

  const rejectStoreStock = async (customer: Customer) => {
    await updateDoc(doc(db, 'customers', customer.id), {
      consultingStore: null,
      storeHasStock: false,
    });
  };

  const acceptTransfer = async (customer: Customer) => {
    await moveToAwaitingTransfer(customer, customer.consultingStore!);
    await updateDoc(doc(db, 'customers', customer.id), {
      consultingStore: null,
      storeHasStock: false,
    });
  };

  const declineTransfer = async (
    customer: Customer,
    reason: ArchiveReason,
    notes?: string
  ) => {
    await updateDoc(doc(db, 'customers', customer.id), {
      archived: true,
      archiveReason: reason,
      archivedAt: new Date().toISOString(),
      notes: notes || '',
    });
  };

  const productArrived = async (customer: Customer) => {
    await markAsContacted(customer);
  };

  const completeOrder = async (customer: Customer) => {
    await moveToFinished(customer);
  };

  return {
    checkStoreCampinas,
    checkStoreDomPedro,
    confirmStoreStock,
    rejectStoreStock,
    acceptTransfer,
    declineTransfer,
    productArrived,
    completeOrder,
  };
}

export default useCustomerActions;
