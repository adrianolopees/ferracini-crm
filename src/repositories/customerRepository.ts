import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CustomerSchema, FirebaseCustomerSchema, Customer, ArchiveReason } from '@/schemas/customerSchema';
import { getCurrentTimestamp } from '@/utils';

const COLLECTION_NAME = 'customers';

// ==========================================
//  CRUD
// ==========================================

/**
 * Busca todos os customers do Firestore
 * Valida cada documento com Zod e filtra registros inválidos
 *
 * @returns Lista de customers válidos
 * @throws {FirebaseError} Se houver erro de conexão com Firestore
 *
 * @example
 * const customers = await getAllCustomers();
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

/**
 * Cria um novo customer no Firestore
 * Adiciona timestamp de criação automaticamente se não fornecido
 *
 * @param customer - Dados do customer (sem ID)
 * @returns ID do documento criado
 * @throws {ZodError} Se validação dos dados falhar
 *
 * @example
 * const id = await createCustomer({
 *   name: 'João Silva',
 *   phone: '11987654321',
 *   status: 'pending'
 * });
 */
export async function createCustomer(customer: Omit<Customer, 'id'>): Promise<string> {
  const validated = FirebaseCustomerSchema.parse({
    ...customer,
    createdAt: customer.createdAt || getCurrentTimestamp(),
  });
  const docRef = await addDoc(collection(db, COLLECTION_NAME), validated);
  return docRef.id;
}

/**
 * Atualiza campos de um customer existente
 * Valida apenas os campos fornecidos (partial update)
 *
 * @param id - ID do customer
 * @param data - Campos a atualizar (parcial)
 * @throws {ZodError} Se validação falhar
 *
 * @example
 * await updateCustomer('abc123', { status: 'completed' });
 */
export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  const { id: _, ...dataWithoutId } = data as any;
  const validated = FirebaseCustomerSchema.partial().parse(dataWithoutId);
  await updateDoc(doc(db, COLLECTION_NAME, id), validated);
}

/**
 * Remove permanentemente um customer do Firestore
 *
 * @param id - ID do customer a ser deletado
 *
 * @example
 * await deleteCustomerById('abc123');
 */
export async function deleteCustomerById(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// ==========================================
//  QUERIES ESPECÍFICAS
// ==========================================

/** @example findCustomersByReference('REF123') */
export async function findCustomersByReference(reference: string): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('reference', '==', reference.toLowerCase()));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

/** @example findCustomersByModel('Sandália Confort') */
export async function findCustomersByModel(model: string): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('model', '==', model.toLowerCase()));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

/** Busca todos os customers arquivados */
export async function findArchivedCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('archived', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const result = CustomerSchema.safeParse({ id: doc.id, ...doc.data() });
      return result.success ? result.data : null;
    })
    .filter((c): c is Customer => c !== null);
}

/** Busca todos os customers com status 'completed' */
export async function findCompletedCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'completed'));
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
    archiveReason: null,
    archivedAt: null,
    notes: null,
    status,
    contactedAt: getCurrentTimestamp(),
  });
}
