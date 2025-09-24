import React, { useEffect, useState } from 'react';
import { PanelContent } from '../types';

interface SandboxPanelProps {
  content: PanelContent | null;
}

const SandboxPanel: React.FC<SandboxPanelProps> = ({ content }) => {
  const [frameSrc, setFrameSrc] = useState<string | null>(null);

  useEffect(() => {
    // When new content arrives, create a new blob URL for it.
    if (content) {
      // Construct the full HTML document from the provided parts.
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                padding: 0;
                font-family: sans-serif; 
                color: #e2e8f0; /* slate-200 */
                background-color: transparent; /* Allow parent bg to show through if needed */
              }
              ${content.css || ''}
            </style>
          </head>
          <body>
            ${content.html || ''}
            <script type="module">
              try {
                // This script will run inside the sandboxed iframe with a proper origin.
                ${content.js || ''}
              } catch (e) {
                console.error('Error executing sandbox script:', e);
                const errorDiv = document.createElement('div');
                errorDiv.style.color = 'red';
                errorDiv.style.fontFamily = 'monospace';
                errorDiv.style.padding = '1rem';
                errorDiv.textContent = 'Error executing script: ' + e.message;
                document.body.appendChild(errorDiv);
              }
            </script>
          </body>
        </html>
      `;

      // Create a Blob, which is a file-like object of immutable, raw data.
      const blob = new Blob([fullHtml], { type: 'text/html' });
      
      // Create a temporary URL that points to the Blob in memory.
      const url = URL.createObjectURL(blob);
      setFrameSrc(url);

      // IMPORTANT: Cleanup function. This will be called when the component
      // unmounts or when the `content` dependency changes, preventing memory leaks.
      return () => {
        URL.revokeObjectURL(url);
        setFrameSrc(null);
      };
    } else {
      // If content is null, ensure we don't have a lingering source.
      setFrameSrc(null);
    }
  }, [content]); // This effect re-runs whenever the `content` prop changes.

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 p-4 bg-gray-900/80 border-b border-gray-700/50">
        <h2 className="text-lg font-bold text-gray-100">Painel de Renderização</h2>
      </div>
      {frameSrc ? (
        <iframe
          src={frameSrc}
          title="Sandbox Panel"
          // These sandbox permissions are crucial for security, but allow the app inside to function.
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups allow-pointer-lock"
          className="w-full h-full border-0 bg-slate-950"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-gray-500 p-8 bg-slate-950">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4-4-4 4-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 21v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2M19 3v2a2 2 0 01-2 2h-7a2 2 0 01-2-2V3" />
            </svg>
            <h3 className="text-xl font-semibold">Área de Renderização</h3>
            <p className="mt-2 max-w-md mx-auto">
              Peça ao Ayage para executar um workflow que retorne uma interface, e ela aparecerá aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SandboxPanel;
