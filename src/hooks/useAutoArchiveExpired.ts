import { autoArchiveExpiredCustomers } from '@/services/customerActionService';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface UseAutoArchiveExpiredOptions {
  enabled?: boolean;
  onComplete?: () => void;
  showToast?: boolean;
}
function useAutoArchiveExpired(options: UseAutoArchiveExpiredOptions = {}) {
  const { enabled = true, onComplete, showToast = true } = options;
  const archiveExpired = useCallback(async () => {
    if (!enabled) return;

    try {
      const count = await autoArchiveExpiredCustomers();

      if (count > 0) {
        if (showToast) {
          toast.success(`${count} cliente(s) arquivado(s) automaticamente (mais de 30 dias de espera)`, {
            duration: 5000,
          });
        }
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Erro ao arquivar clientes expirados:', error);
      if (showToast) {
        toast.error('Erro ao arquivar clientes expirados');
      }
    }
  }, [enabled, onComplete, showToast]);
  useEffect(() => {
    archiveExpired();
  }, [archiveExpired]);
}

export default useAutoArchiveExpired;
