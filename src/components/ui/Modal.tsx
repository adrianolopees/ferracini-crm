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
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8  w-[90vw] max-w-md">
          <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
            {title}
          </Dialog.Title>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
            <Button
              onClick={onConfirm}
              variant="primary"
              className="w-full sm:w-auto sm:px-8"
            >
              Sim, já contatei
            </Button>
            <Button
              onClick={onCancel}
              variant="secondary"
              className="w-full sm:w-auto sm:px-8"
            >
              Ainda não
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
