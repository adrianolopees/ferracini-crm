import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CustomerSchema, FirebaseCustomerSchema, Customer, ArchiveReason } from '@/schemas/customerSchema';
import { WorkspaceId } from '@/schemas/userSchema';
import { getCurrentTimestamp } from '@/utils';

const COLLECTION_NAME = 'customers';

/**
 * Busca todos os customers do workspace atual
 *
 * @param workspaceId - Workspace do usuário logado
 * @returns Lista de customers filtrados por workspace
 *
 * 💡 A mágica acontece aqui: where("workspaceId", "==", workspaceId)
 * Isso garante que você NUNCA veja dados de outro workspace
 */
export async function getAllCustomers(workspaceId: WorkspaceId): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('workspaceId', '==', workspaceId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

/**
 * Cria um novo customer automaticamente no workspace correto
 *
 * @param customer - Dados do customer (sem workspaceId)
 * @param workspaceId - Workspace onde criar o customer
 *
 * 💡 O workspaceId é adicionado automaticamente, o usuário não precisa passar
 */
export async function createCustomer(
  customer: Omit<Customer, 'id' | 'workspaceId'>,
  workspaceId: WorkspaceId
): Promise<string> {
  const validated = FirebaseCustomerSchema.parse({
    ...customer,
    workspaceId,
    createdAt: customer.createdAt || getCurrentTimestamp(),
  });

  const docRef = await addDoc(collection(db, COLLECTION_NAME), validated);
  return docRef.id;
}

/**
 * Atualiza um customer (não permite mudar workspaceId)
 */
export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  const { id: _, workspaceId: __, ...dataWithoutIdAndWorkspace } = data;
  const validated = FirebaseCustomerSchema.partial().parse(dataWithoutIdAndWorkspace);
  await updateDoc(doc(db, COLLECTION_NAME, id), validated);
}

export async function deleteCustomerById(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// ==========================================
//  QUERIES ESPECÍFICAS
// ==========================================

export async function findCustomersByReference(
  reference: string,
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('reference', '==', reference.toLowerCase())
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

export async function findCustomersByModel(
  model: string,
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('model', '==', model.toLowerCase())
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

export async function findArchivedCustomers(
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('archived', '==', true)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

export async function findCompletedCustomers(
  workspaceId: WorkspaceId // ← NOVO parâmetro
): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId), // ← NOVO FILTRO
    where('status', '==', 'completed')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

// ==========================================
// OPERAÇÕES ESPECÍFICAS DE NEGÓCIO
// ==========================================

/**
 * Arquiva um customer com motivo e timestamp
 * Preserva dados para histórico e estatísticas
 *
 * @param id - ID do customer
 * @param reason - Motivo do arquivamento
 * @param notes - Observações opcionais sobre o arquivamento
 *
 * @example
 * await archiveCustomerById('abc123', 'picked_up', 'Cliente retirou produto');
 */
export async function archiveCustomerById(id: string, reason: ArchiveReason, notes?: string): Promise<void> {
  await updateCustomer(id, {
    archived: true,
    archiveReason: reason,
    archivedAt: getCurrentTimestamp(),
    notes: notes || '',
  });
}

/**
 * Restaura um customer arquivado de volta ao fluxo ativo
 * Define novo status e atualiza timestamp de contato
 *
 * @param id - ID do customer arquivado
 * @param status - Novo status após restauração (padrão: 'readyForPickup')
 *
 * @example
 * await restoreCustomerById('abc123', 'pending');
 */
export async function restoreCustomerById(id: string, status: Customer['status'] = 'readyForPickup'): Promise<void> {
  await updateCustomer(id, {
    archived: false,
    archiveReason: undefined,
    archivedAt: undefined,
    notes: undefined,
    status,
    contactedAt: getCurrentTimestamp(),
  });
}
