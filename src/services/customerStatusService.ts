import { updateCustomer } from '@/repositories';
import { Customer, CustomerStatus } from '@/schemas/customerSchema';
import { getCurrentTimestamp } from '@/utils';

export async function updateCustomerStatus(
  customerId: string,
  newStatus: CustomerStatus,
  additionalData?: {
    sourceStore?: 'Campinas' | 'Dom Pedro' | 'Jundiaí';
  }
): Promise<void> {
  const now = getCurrentTimestamp();

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
