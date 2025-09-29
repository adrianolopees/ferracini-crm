import './Modal.css';

function Modal({ isOpen, onConfirm, onCancel, title }) {
  if (!isOpen) return null;

  return (
    <div className="container-modal">
      <div className="modal ativo">
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
