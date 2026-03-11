import { useContext } from 'react';
import { StoreSettingsContext } from '@/contexts/StoreSettingsContext';

export default function useStoreSettings() {
  const context = useContext(StoreSettingsContext);

  if (context === undefined) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider.');
  }

  return context;
}
