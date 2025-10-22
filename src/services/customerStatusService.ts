import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Customer, CustomerStatus } from '@/types/customer';

export async function updateCustomerStatus(
  customerId: string,
  newStatus: CustomerStatus,
  additionalData?: {
    lojaOrigem?: string;
    isFromContactedCollection?: boolean;
  }
): Promise<void> {
  const now = new Date().toISOString();

  const updateData: Partial<Customer> = {
    status: newStatus,
  };

  switch (newStatus) {
    case 'aguardando_transferencia':
      updateData.dataTransferencia = now;
      if (additionalData?.lojaOrigem) {
        updateData.lojaOrigem = additionalData.lojaOrigem;
      }
      break;
    case 'contactado':
      updateData.dataContacto = now;
      break;
    case 'finalizado':
      updateData.dataFinalizacao = now;
      break;
  }

  if (additionalData?.isFromContactedCollection) {
    const contactedRef = doc(db, 'contacted', customerId);
    const contactedSnap = await getDoc(contactedRef);

    if (contactedSnap.exists()) {
      const customerData = contactedSnap.data() as Customer;
      const customerRef = doc(db, 'clientes', customerId);
      await setDoc(customerRef, {
        ...customerData,
        ...updateData,
        id: customerId,
      });
    }
  } else {
    const customerRef = doc(db, 'clientes', customerId);
    await updateDoc(customerRef, updateData);
  }
}

export async function moveToAwaitingTransfer(
  customer: Customer,
  lojaOrigem: 'Campinas' | 'Dom Pedro'
): Promise<void> {
  await updateCustomerStatus(customer.id, 'aguardando_transferencia', {
    lojaOrigem,
  });
}

export async function moveToFinished(
  customer: Customer,
  isFromContactedCollection: boolean = false
): Promise<void> {
  await updateCustomerStatus(customer.id, 'finalizado', {
    isFromContactedCollection,
  });
}

export async function moveToAwaiting(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'aguardando');
}

export async function markAsContacted(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'contactado');
}
