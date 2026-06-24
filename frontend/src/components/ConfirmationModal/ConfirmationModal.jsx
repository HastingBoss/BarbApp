import React from "react";
import "./ConfirmationModal.css";

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        {title && <h3 className="confirm-modal-title">{title}</h3>}
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary-confirm" onClick={onConfirm}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
