import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Customer, CustomerStatus } from '@/types/customer';

export async function updateCustomerStatus(
  customerId: string,
  newStatus: CustomerStatus,
  additionalData?: {
    sourceStore?: string;
    isFromContactedCollection?: boolean;
  }
): Promise<void> {
  const now = new Date().toISOString();

  const updateData: Partial<Customer> = {
    status: newStatus,
  };

  switch (newStatus) {
    case 'awaiting_transfer':
      updateData.transferredAt = now;
      if (additionalData?.sourceStore) {
        updateData.sourceStore = additionalData.sourceStore;
      }
      break;
    case 'ready_for_pickup':
      updateData.contactedAt = now;
      break;
    case 'completed':
      updateData.completedAt = now;
      break;
  }

  if (additionalData?.isFromContactedCollection) {
    const contactedRef = doc(db, 'contacted', customerId);
    const contactedSnap = await getDoc(contactedRef);

    if (contactedSnap.exists()) {
      const customerData = contactedSnap.data() as Customer;
      const customerRef = doc(db, 'customers', customerId);
      await setDoc(customerRef, {
        ...customerData,
        ...updateData,
        id: customerId,
      });
    }
  } else {
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, updateData);
  }
}

export async function moveToAwaitingTransfer(
  customer: Customer,
  sourceStore: 'Campinas' | 'Dom Pedro'
): Promise<void> {
  await updateCustomerStatus(customer.id, 'awaiting_transfer', {
    sourceStore,
  });
}

export async function moveToFinished(
  customer: Customer,
  isFromContactedCollection: boolean = false
): Promise<void> {
  await updateCustomerStatus(customer.id, 'completed', {
    isFromContactedCollection,
  });
}

export async function moveToAwaiting(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'pending');
}

export async function markAsContacted(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'ready_for_pickup');
}
