import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';
import { StoreSettings, Store, UpdateStore, CreateStore } from '../schemas/storeSettingsSchema';
import { getStoreSettings, createStore, saveStore, deleteStore } from '../repositories/storeSettingsRepository';

export function useStoreSettings() {
  const { workspaceId } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!workspaceId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getStoreSettings(workspaceId);
      setSettings(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Dados derivados
  const allStores = settings?.stores || [];
  const defaultStore = allStores.find((s) => s.id === workspaceId) || null;
  const transferStores = allStores.filter((s) => s.id !== workspaceId);

  // Mutations
  const addStore = async (newStore: CreateStore): Promise<Store> => {
    if (!workspaceId) throw new Error('Usuário não autenticado');

    const store = await createStore(workspaceId, newStore);
    // Atualiza state local
    setSettings((prev) => (prev ? { ...prev, stores: [...prev.stores, store] } : null));
    return store;
  };

  const updateStore = async (storeId: string, updates: UpdateStore): Promise<void> => {
    if (!workspaceId) throw new Error('Usuário não autenticado');

    await saveStore(workspaceId, storeId, updates);
    // Atualiza state local
    setSettings((prev) => {
      if (!prev) return null;
      const updatedStores = prev.stores.map((s) => (s.id === storeId ? { ...s, ...updates } : s));
      return { ...prev, stores: updatedStores };
    });
  };

  const removeStore = async (storeId: string): Promise<void> => {
    if (!workspaceId) throw new Error('Usuário não autenticado');

    await deleteStore(workspaceId, storeId);
    // Atualiza state local
    setSettings((prev) => {
      if (!prev) return null;
      return { ...prev, stores: prev.stores.filter((s) => s.id !== storeId) };
    });
  };

  // Utility
  const getStoreByName = (name: string): Store | undefined => {
    return allStores.find((s) => s.name === name);
  };

  return {
    settings,
    defaultStore,
    transferStores,
    allStores,
    loading,
    error,
    addStore,
    updateStore,
    removeStore,
    getStoreByName,
    refetch: fetchSettings,
  };
}
