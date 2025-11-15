// frontend/src/components/ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-900 text-gray-100 rounded-2xl shadow-xl p-6 w-80">
        <h2 className="text-lg font-semibold mb-3 text-center">{title}</h2>
        <p className="text-sm text-gray-400 mb-6 text-center">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
