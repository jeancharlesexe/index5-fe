import React from 'react';
import './Modal.css';
import { X } from 'lucide-react';
import Button from '../Button/Button';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'info' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <Button onClick={onClose} className="btn-cancel">
                        {cancelText}
                    </Button>
                    <Button onClick={onConfirm} className={`btn-confirm ${type}`}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
