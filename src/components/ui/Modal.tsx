import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  title?: string;
}

function Modal({ isOpen, title, onClose, onConfirm, onCancel }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="container-modal" onClick={onClose}>
      <div className="modal ativo" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="btn-container-modal">
          <button className="sim" onClick={onConfirm}>
            Sim
          </button>
          <button className="nao" onClick={onCancel}>
            Não
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
