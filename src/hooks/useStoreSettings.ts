import { useContext } from 'react';
import { StoreSettingsContext } from '@/contexts/StoreSettingsContext';

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
