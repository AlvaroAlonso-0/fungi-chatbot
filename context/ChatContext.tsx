// context/ChatContext.tsx
"use client"; // This makes the file a Client Component

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatMessage = {
  id: number;
  text: string;
  role: 'user' | 'bot';
};

type ChatContextType = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
