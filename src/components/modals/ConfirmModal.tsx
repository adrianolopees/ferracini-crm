import { DialogModal } from '@/components/modals';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
}

function ConfirmModal({
  isOpen,
  customerName,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <DialogModal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão">
      <div className="space-y-4">
        <p className="text-gray-700">
          Tem certeza que deseja{' '}
          <span className="font-semibold text-red-600">
            excluir permanentemente
          </span>{' '}
          <span className="font-semibold">{customerName}</span>?
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex gap-2">
            <i className="fa-solid fa-triangle-exclamation text-red-600 mt-0.5"></i>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Atenção: Esta ação é irreversível!
              </p>
              <p className="text-sm text-red-700 mt-1">
                Todos os dados deste cliente serão excluídos permanentemente e
                não poderão ser recuperados.
              </p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
          >
            Excluir Permanentemente
          </button>
        </div>
      </div>
    </DialogModal>
  );
}

export default ConfirmModal;
