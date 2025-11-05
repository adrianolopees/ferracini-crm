import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer, ArchiveReason } from '@/types/customer';
import {
  notifyOtherStore,
  notifyProductArrived,
  sendStoreCampinas,
  sendStoreDomPedro,
} from '@/services/whatsappService';
import {
  moveToAwaitingTransfer,
  markAsContacted,
  moveToFinished,
} from '@/services/customerStatusService';

export async function checkStoreCampinas(customer: Customer): Promise<void> {
  await updateDoc(doc(db, 'customers', customer.id), {
    consultingStore: 'Campinas',
  });
  sendStoreCampinas(customer);
}

export async function checkStoreDomPedro(customer: Customer): Promise<void> {
  await updateDoc(doc(db, 'customers', customer.id), {
    consultingStore: 'Dom Pedro',
  });
  sendStoreDomPedro(customer);
}

export async function confirmStoreStock(customer: Customer): Promise<void> {
  await updateDoc(doc(db, 'customers', customer.id), {
    storeHasStock: true,
  });
  notifyOtherStore(customer);
}

export async function rejectStoreStock(customer: Customer): Promise<void> {
  await updateDoc(doc(db, 'customers', customer.id), {
    consultingStore: null,
    storeHasStock: false,
  });
}

export async function acceptTransfer(customer: Customer): Promise<void> {
  await moveToAwaitingTransfer(customer, customer.consultingStore!);
  await updateDoc(doc(db, 'customers', customer.id), {
    consultingStore: null,
    storeHasStock: false,
  });
}

export async function declineTransfer(
  customer: Customer,
  reason: ArchiveReason,
  notes?: string
): Promise<void> {
  await updateDoc(doc(db, 'customers', customer.id), {
    archived: true,
    archiveReason: reason,
    archivedAt: new Date().toISOString(),
    notes: notes || '',
  });
}

export async function productArrived(customer: Customer): Promise<void> {
  await markAsContacted(customer);
  notifyProductArrived(customer);
}

export async function completeOrder(customer: Customer): Promise<void> {
  await moveToFinished(customer);
}

export async function restoreFromArchive(customer: Customer): Promise<void> {
  await updateDoc(doc(db, 'customers', customer.id), {
    archived: false,
    archiveReason: null,
    archivedAt: null,
    notes: null,
    status: 'ready_for_pickup',
    contactedAt: new Date().toISOString(),
  });
}

export async function resetToInitial(customer: Customer): Promise<void> {
  await updateDoc(doc(db, 'customers', customer.id), {
    consultingStore: null,
    storeHasStock: false,
    status: 'pending',
    sourceStore: null,
    transferredAt: null,
    contactedAt: null,
  });
}
