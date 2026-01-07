import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { StoreSettings, Store, StoreSettingsSchema, UpdateStore, CreateStore } from '@/schemas/storeSettingsSchema';
import { getCurrentTimestamp } from '@/utils';

export async function getStoreSettings(workspaceId: string): Promise<StoreSettings | null> {
  try {
    const docRef = doc(db, 'workspace_settings', workspaceId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn(`Workspace settings not found: ${workspaceId}`);
      return null;
    }

    const data = docSnap.data();
    const parsed = StoreSettingsSchema.parse(data);
    return parsed;
  } catch (error) {
    console.error('Error getting store settings:', error);
    throw error;
  }
}

export async function updateStore(
  workspaceId: string,
  storeId: string,
  updates: UpdateStore,
  userEmail: string
): Promise<void> {
  try {
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

    const docRef = doc(db, 'workspace_settings', workspaceId);
    await updateDoc(docRef, {
      stores: updatedStores,
      updatedAt: getCurrentTimestamp(),
      updatedBy: userEmail,
    });
    console.log(`✅ Loja ${storeId} atualizada`);
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
}
