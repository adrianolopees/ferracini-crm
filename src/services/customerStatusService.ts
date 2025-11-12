import { updateCustomer } from '@/repositories';
import { Customer, CustomerStatus } from '@/types/customer';

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

  await updateCustomer(customerId, updateData);
}

export async function moveToAwaitingTransfer(
  customer: Customer,
  sourceStore: 'Campinas' | 'Dom Pedro' | 'Jundiaí'
): Promise<void> {
  await updateCustomerStatus(customer.id, 'awaiting_transfer', {
    sourceStore,
  });
}

export async function moveToFinished(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'completed');
}

export async function markAsContacted(customer: Customer): Promise<void> {
  await updateCustomerStatus(customer.id, 'ready_for_pickup');
}
