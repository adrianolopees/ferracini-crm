import { createContext, useState, useEffect, ReactNode } from 'react';
import useAuth from '@/hooks/useAuth';
import { StoreSettings, Store, UpdateStore, CreateStore } from '@/schemas/storeSettingsSchema';
import { onStoreSettingsChange, createStore, saveStore, deleteStore } from '@/repositories/storeSettingsRepository';

interface StoreSettingsContextType {
  settings: StoreSettings | null;
  defaultStore: Store | null;
  transferStores: Store[];
  allStores: Store[];
  loading: boolean;
  error: Error | null;
  addStore: (newStore: CreateStore) => Promise<Store>;
  updateStore: (storeId: string, updates: UpdateStore) => Promise<void>;
  removeStore: (storeId: string) => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({} as StoreSettingsContextType);

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const { workspaceId } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('useEffect chamado montado pro worspaceId:', workspaceId);
    if (!workspaceId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onStoreSettingsChange(workspaceId, (newSettings) => {
      console.log('listener acionado e configuraçoes setadas:', newSettings);
      setSettings(newSettings);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [workspaceId]);

  const allStores = settings?.stores || [];
  const defaultStore = allStores.find((s) => s.id === workspaceId) || null;
  const transferStores = allStores.filter((s) => s.id !== workspaceId);

  const getWorkspaceId = (): string => {
    if (!workspaceId) throw new Error('Usuário não autenticado');
    return workspaceId;
  };

  const addStore = async (newStore: CreateStore): Promise<Store> => {
    return await createStore(getWorkspaceId(), newStore);
  };

  const updateStore = async (storeId: string, updates: UpdateStore): Promise<void> => {
    await saveStore(getWorkspaceId(), storeId, updates);
  };

  const removeStore = async (storeId: string): Promise<void> => {
    await deleteStore(getWorkspaceId(), storeId);
  };

  return (
    <StoreSettingsContext.Provider
      value={{ settings, defaultStore, transferStores, allStores, loading, error, addStore, updateStore, removeStore }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export { StoreSettingsContext };
