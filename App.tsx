
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, MessageRole, Webhook, PanelContent } from './types';
import { sendMessageToGemini, initializeOrUpdateGemini } from './services/geminiService';
import Header from './components/Header';
import ChatMessageComponent from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';
import SettingsModal from './components/SettingsModal';
import SandboxPanel from './components/SandboxPanel';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // State for the new dynamic panel
  const [panelContent, setPanelContent] = useState<PanelContent | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  useEffect(() => {
    try {
      const storedWebhooks = localStorage.getItem('webhooks');
      const loadedWebhooks = storedWebhooks ? JSON.parse(storedWebhooks) : [];
      setWebhooks(loadedWebhooks);
      
      initializeOrUpdateGemini(loadedWebhooks);
    } catch (err) {
        console.error("Failed to load settings or initialize Gemini:", err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during initialization.';
        setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    try {
      initializeOrUpdateGemini(webhooks);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  }, [webhooks]);

  const handleRenderPanel = (content: PanelContent) => {
    setPanelContent(content);
    if(isChatCollapsed) {
        // Optional: automatically open the chat if it's collapsed when new content is rendered
        // setIsChatCollapsed(false);
    }
  };

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;
    setError(null);
    const newMessages: ChatMessage[] = [...messages, { role: MessageRole.USER, content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const modelResponse = await sendMessageToGemini(userInput, handleRenderPanel);
      setMessages([...newMessages, { role: MessageRole.MODEL, content: modelResponse }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Erro: ${errorMessage}`);
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebhook = (name: string, url: string) => {
    const newWebhook: Webhook = { id: Date.now().toString(), name, url };
    const updatedWebhooks = [...webhooks, newWebhook];
    setWebhooks(updatedWebhooks);
    localStorage.setItem('webhooks', JSON.stringify(updatedWebhooks));
  };

  const handleRemoveWebhook = (id: string) => {
    const updatedWebhooks = webhooks.filter(wh => wh.id !== id);
    setWebhooks(updatedWebhooks);
    localStorage.setItem('webhooks', JSON.stringify(updatedWebhooks));
  };

  return (
    <div className="flex h-screen bg-slate-900 text-gray-200 font-sans overflow-hidden">
      {/* Chat Panel */}
      <div className={`flex flex-col transition-all duration-300 ease-in-out ${isChatCollapsed ? 'w-0' : 'w-full md:w-[45%] lg:w-[35%]'}`}>
         <div className={`flex flex-col h-full w-full overflow-hidden ${isChatCollapsed ? 'invisible' : 'visible'}`}>
            <Header onOpenSettings={() => setIsSettingsOpen(true)} />
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg, index) => (
                <ChatMessageComponent key={index} message={msg} />
                ))}
                {isLoading && <LoadingIndicator />}
                {error && (
                    <div className="max-w-4xl mx-auto bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                        <p>{error}</p>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* Divider and Toggle Button */}
      <div className="relative group flex-shrink-0">
        <div className="w-1.5 h-full bg-slate-800 group-hover:bg-teal-500 transition-colors duration-200 cursor-col-resize" onClick={() => setIsChatCollapsed(!isChatCollapsed)}></div>
        <button 
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            className="absolute top-1/2 -translate-y-1/2 -right-3 z-20 w-7 h-14 bg-slate-700 border-2 border-slate-800 rounded-full text-slate-400 hover:bg-teal-500 hover:text-white hover:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={isChatCollapsed ? 'Expand chat panel' : 'Collapse chat panel'}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mx-auto transition-transform duration-300 ${isChatCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
      </div>

      {/* Sandbox Panel */}
      <div className="flex-1 flex flex-col bg-slate-950">
        <SandboxPanel content={panelContent} />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        webhooks={webhooks}
        onAddWebhook={handleAddWebhook}
        onRemoveWebhook={handleRemoveWebhook}
      />
    </div>
  );
};

export default App;
