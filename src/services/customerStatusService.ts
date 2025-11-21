import { updateCustomer } from '@/repositories';
import { Customer, CustomerStatus } from '@/schemas/customerSchema';

export async function updateCustomerStatus(
  customerId: string,
  newStatus: CustomerStatus,
  additionalData?: {
    sourceStore?: 'Campinas' | 'Dom Pedro' | 'Jundiaí';
  }
): Promise<void> {
  const now = new Date().toISOString();

  const updateData: Partial<Customer> = {
    status: newStatus,
  };

  switch (newStatus) {
    case 'awaitingTransfer':
      updateData.transferredAt = now;
      if (additionalData?.sourceStore) {
        updateData.sourceStore = additionalData.sourceStore;
      }
      break;
    case 'readyForPickup':
      updateData.contactedAt = now;
      break;
    case 'completed':
      updateData.completedAt = now;
      break;
  }

  await updateCustomer(customerId, updateData);
}

export async function moveToAwaitingTransfer(
  customer: Customer,
  sourceStore: 'Campinas' | 'Dom Pedro' | 'Jundiaí'
): Promise<void> {
  await updateCustomerStatus(customer.id, 'awaitingTransfer', {
    sourceStore,
  });
}

export async function moveToFinished(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'completed');
}

export async function markAsContacted(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'readyForPickup');
}
