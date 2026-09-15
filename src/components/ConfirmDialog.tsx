import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ConfirmConfig } from '../context/AppContext';

interface Props {
  config: ConfirmConfig;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({ config, onClose }) => {
  if (!config.isOpen) return null;

  return (
    <div
      id="confirm-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="confirm-dialog-modal"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              config.isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
              {config.title}
            </h3>
            <p id="confirm-dialog-message" className="mt-1 text-sm text-slate-600 leading-relaxed">
              {config.message}
            </p>
          </div>
          <button
            id="confirm-dialog-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            id="confirm-dialog-cancel-btn"
            type="button"
            onClick={() => {
              if (config.onCancel) config.onCancel();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            বাতিল (Cancel)
          </button>
          <button
            id="confirm-dialog-action-btn"
            type="button"
            onClick={() => {
              config.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition ${
              config.isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'
            }`}
          >
            {config.confirmLabel || 'নিশ্চিত করুন (Confirm)'}
          </button>
        </div>
      </div>
    </div>
  );
};
