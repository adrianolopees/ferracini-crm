import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer, ArchiveReason } from '@/types/customer';

const COLLECTION_NAME = 'customers';

// ==========================================
// 🔹 CRUD BÁSICO
// ==========================================

export async function getAllCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Customer;
}

export async function createCustomer(customer: Omit<Customer, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...customer,
    createdAt: customer.createdAt || new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
}

export async function deleteCustomerById(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
// ==========================================
// 🔹 QUERIES ESPECÍFICAS
// ==========================================

export async function findCustomersByPhone(phone: string): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('phone', '==', phone));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

export async function findCustomersByStatus(status: Customer['status']): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('status', '==', status));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}
export async function findCustomersByReference(reference: string): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('reference', '==', reference.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

export async function findCustomersByModel(model: string): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('model', '==', model.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

export async function findArchivedCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('archived', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

export async function findCompletedCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'completed'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

export async function findTransferCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('sourceStore', 'in', ['Campinas', 'Dom Pedro']));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

export async function findActiveCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION_NAME), where('archived', '==', false));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Customer);
}

// ==========================================
// 🔹 OPERAÇÕES ESPECÍFICAS DE NEGÓCIO
// ==========================================

export async function archiveCustomerById(id: string, reason: ArchiveReason, notes?: string): Promise<void> {
  await updateCustomer(id, {
    archived: true,
    archiveReason: reason,
    archivedAt: new Date().toISOString(),
    notes: notes || '',
  });
}

export async function restoreCustomerById(id: string, status: Customer['status'] = 'ready_for_pickup'): Promise<void> {
  await updateCustomer(id, {
    archived: false,
    archiveReason: null,
    archivedAt: null,
    notes: null,
    status,
    contactedAt: new Date().toISOString(),
  });
}
