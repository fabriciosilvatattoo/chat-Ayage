
import React from 'react';
import { ChatMessage, MessageRole } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

const ModelIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.44 12.99c-.27-.27-.58-.4-1.1-.39-.55.02-1.13.3-1.6.81-.44.48-.81.96-1.14 1.41-.33.45-.63.9-.91 1.33-.27.43-.53.84-.78 1.25-.25.41-.5.79-.73 1.15-.23.36-.45.71-.67 1.05-.22.34-.43.66-.63.97-.2.31-.39.6-.57.88-.18.28-.35.54-.51.79-.16.25-.32.49-.46.71-.14.22-.27.44-.4.64-.13.2-.25.39-.37.57-.11.18-.22.35-.32.51-.1.16-.19.31-.28.45l-.01.01c-.24.39-.49.77-.75 1.12-.26.35-.54.68-.83.99-.29.31-.6.59-.91.83-.32.24-.65.45-.98.62-.33.17-.67.31-1.01.41-.34.1-.68.16-1.02.16-1.13 0-2.26-.45-3.08-1.28-1.25-1.25-1.63-3.02-1.07-4.52.56-1.5 1.84-2.58 3.42-2.92.57-.12 1.13-.15 1.68-.09.55.06 1.09.21 1.62.45.52.24 1.03.56 1.51.96.48.4.94.88 1.35 1.44.29.39.56.79.81 1.2.25.41.48.83.69 1.26.21.43.41.86.58 1.3.17.44.33.88.45 1.33.12.45.21.91.27 1.37.06.46.09.92.09 1.38 0 .43-.02.86-.07 1.28-.05.42-.12.84-.21 1.25-.09.41-.2.81-.34 1.2-.14.39-.29.77-.47 1.14-.18.37-.38.72-.6 1.06-.22.34-.45.66-.71.97-.26.31-.53.6-.82.88-.29.28-.6.54-92.79-.32.25-.46.49-.62.71-.14.22-.27.44-.4.64-.13.2-.25.39-.37.57z"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
    </svg>
);


const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  const wrapperClasses = `flex items-start gap-4 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `relative rounded-xl px-5 py-3 shadow-lg max-w-2xl whitespace-pre-wrap ${
    isUser
      ? 'bg-sky-600 text-white rounded-br-none'
      : 'bg-gray-700 text-gray-200 rounded-bl-none'
  }`;

  return (
    <div className={wrapperClasses}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600">
           <ModelIcon />
        </div>
      )}
      <div className={bubbleClasses}>
        <p className="text-base leading-relaxed">{message.content}</p>
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center border-2 border-gray-500">
           <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessageComponent;
