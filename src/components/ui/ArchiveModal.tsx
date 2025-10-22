import { useState } from 'react';
import { DialogModal } from '@/components/ui';
import { ArchiveReason } from '@/types/customer';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: ArchiveReason, notes?: string) => void;
  customerName: string;
}

function ArchiveModal({
  isOpen,
  onClose,
  onConfirm,
  customerName,
}: ArchiveModalProps) {
  const [selectedReason, setSelectedReason] =
    useState<ArchiveReason>('Desistiu');
  const [notes, setNotes] = useState('');

  const reasons: ArchiveReason[] = [
    'Desistiu',
    'Não respondeu',
    'Comprou concorrente',
    'Produto não disponível',
    'Outro',
  ];

  const handleConfirm = () => {
    onConfirm(selectedReason, notes.trim() || undefined);
    // Reset form
    setSelectedReason('Desistiu');
    setNotes('');
  };

  const handleCancel = () => {
    // Reset form
    setSelectedReason('Desistiu');
    setNotes('');
    onClose();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Arquivar Cliente"
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Deseja arquivar <span className="font-semibold">{customerName}</span>?
        </p>
        <p className="text-sm text-gray-500">
          O cliente será removido da lista ativa, mas seus dados serão
          preservados no histórico.
        </p>

        {/* Dropdown de motivo */}
        <div>
          <label
            htmlFor="archive-reason"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Motivo do arquivamento *
          </label>
          <select
            id="archive-reason"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value as ArchiveReason)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          >
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Textarea para observações */}
        <div>
          <label
            htmlFor="archive-notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Observações (opcional)
          </label>
          <textarea
            id="archive-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione detalhes se necessário..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Arquivar
          </button>
        </div>
      </div>
    </DialogModal>
  );
}

export default ArchiveModal;
