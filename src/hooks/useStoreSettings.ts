import { useContext } from 'react';
import { StoreSettingsContext } from '@/contexts/StoreSettingsContext';

export default function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
