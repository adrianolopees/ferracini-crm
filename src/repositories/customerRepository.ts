import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  deleteField,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CustomerSchema, FirebaseCustomerSchema, Customer } from '@/schemas/customerSchema';
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
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId),
    orderBy('createdAt', 'desc')
  );
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

  // Converte undefined para deleteField() para Firebase aceitar a remoção de campos
  const firebaseData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(validated)) {
    firebaseData[key] = value === undefined ? deleteField() : value;
  }

  await updateDoc(doc(db, COLLECTION_NAME, id), firebaseData);
}

export async function deleteCustomerById(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// ==========================================
//  QUERIES ESPECÍFICAS
// ==========================================

export async function findArchivedCustomers(workspaceId: WorkspaceId): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId),
    where('archived', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

export async function findCompletedCustomers(workspaceId: WorkspaceId): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('workspaceId', '==', workspaceId),
    where('status', '==', 'completed'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}
