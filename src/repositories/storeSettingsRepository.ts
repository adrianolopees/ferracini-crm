import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { StoreSettings, Store, StoreSettingsSchema, UpdateStore, CreateStore } from '@/schemas/storeSettingsSchema';
import { getCurrentTimestamp } from '@/utils';

const COLLECTION_NAME = 'workspace_settings';

export async function getStoreSettings(workspaceId: string): Promise<StoreSettings | null> {
  const docRef = doc(db, COLLECTION_NAME, workspaceId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  const result = StoreSettingsSchema.safeParse(data);
  return result.success ? result.data : null;
}

export async function updateStore(workspaceId: string, storeId: string, updates: UpdateStore): Promise<void> {
  const currentSettings = await getStoreSettings(workspaceId);
  if (!currentSettings) {
    throw new Error('Workspace settings not found');
  }

  const storeIndex = currentSettings.stores.findIndex((s) => s.id === storeId);
  if (storeIndex === -1) {
    throw new Error(`Store ${storeId} not found`);
  }

  const updatedStore: Store = {
    ...currentSettings.stores[storeIndex],
    ...updates,
  };

  const updatedStores = [...currentSettings.stores];
  updatedStores[storeIndex] = updatedStore;

  const docRef = doc(db, COLLECTION_NAME, workspaceId);
  await updateDoc(docRef, {
    stores: updatedStores,
    updatedAt: getCurrentTimestamp(),
  });
}

export async function addStore(workspaceId: string, newStore: CreateStore): Promise<Store> {
  const currentSettings = await getStoreSettings(workspaceId);
  if (!currentSettings) {
    throw new Error('Workspace settings not found');
  }

  const storeId = `store-${crypto.randomUUID()}`;

  const store: Store = {
    ...newStore,
    id: storeId,
  };

  const updatedStores = [...currentSettings.stores, store];

  const docRef = doc(db, COLLECTION_NAME, workspaceId);
  await updateDoc(docRef, {
    stores: updatedStores,
    updatedAt: getCurrentTimestamp(),
  });
  return store;
}

/* export async function removeStore(workspaceId: string, storeId: string) {
  const currentSettings = await getStoreSettings(workspaceId);
  if (!currentSettings) {
    return null;
  }

} */
