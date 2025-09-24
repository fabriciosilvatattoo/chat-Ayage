
import React, { useState, useRef, useEffect } from 'react';
import { Webhook } from '../types';

// FIX: Removed props related to API key management.
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhooks: Webhook[];
  onAddWebhook: (name: string, url: string) => void;
  onRemoveWebhook: (id: string) => void;
}

// FIX: Removed unused maskApiKey function.

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  webhooks,
  onAddWebhook,
  onRemoveWebhook,
}) => {
  // FIX: Removed state for new API key.
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // FIX: Removed handler for adding API key.

  const handleAddWebhookClick = () => {
    if (webhookName.trim() && webhookUrl.trim()) {
        onAddWebhook(webhookName.trim(), webhookUrl.trim());
        setWebhookName('');
        setWebhookUrl('');
    }
  };
  
  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close modal on outside click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
    >
      <div ref={modalRef} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg m-4 border border-gray-700/50 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Configurações</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* FIX: Removed API Key management section and adjusted layout. */}
        <div className="p-6 overflow-y-auto">
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Gerenciar Webhooks</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="webhook-name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Webhook</label>
                  <input
                    id="webhook-name"
                    type="text"
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    placeholder="Ex: iniciar_backup"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-300 mb-1">URL do Webhook</label>
                  <input
                    id="webhook-url"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-webhook.com/..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button onClick={handleAddWebhookClick} className="w-full bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 disabled:opacity-50" disabled={!webhookName.trim() || !webhookUrl.trim()}>
                    Adicionar Webhook
                </button>
              </div>

              <h4 className="text-md font-semibold text-white mb-3">Webhooks Salvos</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                 {webhooks.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Nenhum webhook salvo.</p>
                 ) : (
                    webhooks.map(wh => (
                        <div key={wh.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-200">{wh.name}</p>
                                <p className="font-mono text-xs text-gray-400 truncate max-w-xs">{wh.url}</p>
                            </div>
                            <button onClick={() => onRemoveWebhook(wh.id)} className="text-red-500 hover:text-red-400 flex-shrink-0" aria-label={`Remove webhook ${wh.name}`}>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                               </svg>
                            </button>
                        </div>
                    ))
                 )}
              </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
