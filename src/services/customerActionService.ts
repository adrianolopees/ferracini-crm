import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import {
  notifyOtherStore,
  notifyProductArrived,
  sendStoreCampinas,
  sendStoreDomPedro,
} from '@/services/whatsappService';
import { archiveCustomerById, updateCustomer } from '@/repositories';
import { getCurrentTimestamp } from '@/utils';

// ============================================
//  FUNÇÕES DE MUDANÇA DE STATUS
// ============================================

export async function moveToReadyForPickup(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    status: 'readyForPickup',
    contactedAt: getCurrentTimestamp(),
  });
}

export async function resetToInitial(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    consultingStore: undefined,
    storeHasStock: false,
    status: 'pending',
    sourceStore: undefined,
    transferredAt: undefined,
    contactedAt: undefined,
  });
}

// ============================================
//  FUNÇÕES DE NEGÓCIO (Workflow)
// ============================================

export async function checkStoreCampinas(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    consultingStore: 'Campinas',
  });
  sendStoreCampinas(customer);
}

export async function checkStoreDomPedro(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    consultingStore: 'Dom Pedro',
  });
  sendStoreDomPedro(customer);
}

export async function confirmStoreStock(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    storeHasStock: true,
  });
  notifyOtherStore(customer);
}

export async function rejectStoreStock(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    consultingStore: undefined,
    storeHasStock: false,
  });
}

export async function acceptTransfer(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    status: 'awaitingTransfer',
    sourceStore: customer.consultingStore!,
    transferredAt: getCurrentTimestamp(),
    consultingStore: undefined,
    storeHasStock: false,
  });
}

export async function declineTransfer(customer: Customer, reason: ArchiveReason, notes?: string): Promise<void> {
  await updateCustomer(customer.id, {
    consultingStore: undefined,
    storeHasStock: false,
  });

  await archiveCustomerById(customer.id, reason, notes);
}

export async function productArrived(customer: Customer): Promise<void> {
  await moveToReadyForPickup(customer);
  notifyProductArrived(customer);
}

export async function completeOrder(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    status: 'completed',
    completedAt: getCurrentTimestamp(),
  });
}
