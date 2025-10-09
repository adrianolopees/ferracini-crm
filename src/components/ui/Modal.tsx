import * as Dialog from '@radix-ui/react-dialog';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  title?: string;
}

function Modal({ isOpen, title, onClose, onConfirm, onCancel }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={onConfirm} variant="primary">
              Sim, já contatei
            </Button>
            <Button onClick={onCancel} variant="secondary">
              Ainda não
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
