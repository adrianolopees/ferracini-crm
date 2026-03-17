import DialogModal from '@/components/modals/DialogModal';
import SettingsContent from './SettingsContent';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <DialogModal isOpen={isOpen} onClose={onClose} title="Configurações">
      <SettingsContent />
    </DialogModal>
  );
}
