import { Customer, ArchiveReason } from '@/schemas/customer';
import {
  notifyOtherStore,
  notifyProductArrived,
  sendStoreCampinas,
  sendStoreDomPedro,
} from '@/services/whatsappService';
import { moveToAwaitingTransfer, markAsContacted, moveToFinished } from '@/services/customerStatusService';
import { updateCustomer, archiveCustomerById, restoreCustomerById, deleteCustomerById } from '@/repositories';

// ============================================
// 🔹 FUNÇÕES GENÉRICAS (Low-level)
// ============================================
export async function archiveCustomer(customer: Customer, reason: ArchiveReason, notes?: string): Promise<void> {
  await archiveCustomerById(customer.id, reason, notes);
}

export async function restoreFromArchive(customer: Customer): Promise<void> {
  await restoreCustomerById(customer.id);
}

export async function deleteCustomer(customer: Customer): Promise<void> {
  await deleteCustomerById(customer.id);
}

export async function moveToReadyForPickup(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    status: 'ready_for_pickup',
    contactedAt: new Date().toISOString(),
  });
}

export async function resetToInitial(customer: Customer): Promise<void> {
  await updateCustomer(customer.id, {
    consultingStore: null,
    storeHasStock: false,
    status: 'pending',
    sourceStore: null,
    transferredAt: null,
    contactedAt: null,
  });
}

// ============================================
// 🔹 FUNÇÕES DE NEGÓCIO (High-level)
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
    consultingStore: null,
    storeHasStock: false,
  });
}

export async function acceptTransfer(customer: Customer): Promise<void> {
  await moveToAwaitingTransfer(customer, customer.consultingStore!);
  await updateCustomer(customer.id, {
    consultingStore: null,
    storeHasStock: false,
  });
}

export async function declineTransfer(customer: Customer, reason: ArchiveReason, notes?: string): Promise<void> {
  await updateCustomer(customer.id, {
    consultingStore: null,
    storeHasStock: false,
  });

  await archiveCustomer(customer, reason, notes);
}

export async function productArrived(customer: Customer): Promise<void> {
  await markAsContacted(customer);
  notifyProductArrived(customer);
}

export async function completeOrder(customer: Customer): Promise<void> {
  await moveToFinished(customer);
}
