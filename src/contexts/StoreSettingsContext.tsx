import { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import useAuth from '@/hooks/useAuth';
import { StoreSettings, Store, UpdateStore, CreateStore } from '@/schemas/storeSettingsSchema';
import {
  onStoreSettingsChange,
  createStore,
  saveStore,
  deleteStore,
  createSalesperson,
  deleteSalesperson,
} from '@/repositories/storeSettingsRepository';
import { WorkspaceId } from '@/schemas/userSchema';

export interface StoreSettingsContextType {
  settings: StoreSettings | null;
  defaultStore: Store | null;
  transferStores: Store[];
  allStores: Store[];
  salespeople: string[];
  loading: boolean;
  error: Error | null;
  addStore: (newStore: CreateStore) => Promise<Store>;
  updateStore: (storeId: string, updates: UpdateStore) => Promise<void>;
  removeStore: (storeId: string) => Promise<void>;
  addSalesperson: (name: string) => Promise<void>;
  removeSalesperson: (name: string) => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const { workspaceId } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onStoreSettingsChange(
      workspaceId,
      (newSettings) => {
        setSettings(newSettings);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [workspaceId]);

  const allStores = useMemo(() => settings?.stores || [], [settings]);
  const defaultStore = useMemo(() => allStores.find((s) => s.id === workspaceId) || null, [allStores, workspaceId]);
  const transferStores = useMemo(() => allStores.filter((s) => s.id !== workspaceId), [allStores, workspaceId]);
  const salespeople = useMemo(() => settings?.salespeople || [], [settings]);

  const getWorkspaceId = (): WorkspaceId => {
    if (!workspaceId) throw new Error('User not authenticated');
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

  const addSalesperson = async (name: string): Promise<void> => {
    await createSalesperson(getWorkspaceId(), name);
  };

  const removeSalesperson = async (name: string): Promise<void> => {
    await deleteSalesperson(getWorkspaceId(), name);
  };

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        defaultStore,
        transferStores,
        allStores,
        salespeople,
        loading,
        error,
        addStore,
        updateStore,
        removeStore,
        addSalesperson,
        removeSalesperson,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export { StoreSettingsContext };
