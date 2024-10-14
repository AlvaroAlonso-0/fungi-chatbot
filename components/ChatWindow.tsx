// components/ChatWindow.tsx
"use client";

import { useChat } from '../context/ChatContext';
import { useState } from 'react';
import Image from 'next/image';
import { FiSend } from 'react-icons/fi'; // Import an arrow icon for the send button
import logo from '../public/logo.jpg'; // Ensure this path is correct for your logo

const ChatWindow = () => {
  const { messages, addMessage } = useChat();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now(), text: input, role: 'user' as const };
    addMessage(userMessage);

    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      const botMessage = { id: Date.now(), text: data.reply, role: 'bot' as const };
      addMessage(botMessage);
    } catch (error) {
      setError('Failed to fetch response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-[700px] mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* Logo */}
      <div className="mb-4 flex justify-start">
        <Image src={logo} alt="Logo" width={50} height={50} className="rounded-full" />
      </div>

      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto mb-6 p-6 bg-gray-50 rounded-lg">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={'my-6 text-left'}
          >
            <div className="text-sm text-gray-500 mb-1">
              {msg.role === 'user' ? 'You' : 'Fungi'}
            </div>
            <div
              className={`inline-block p-4 rounded-3xl ${
                msg.role === 'user'
                  ? 'bg-gray-200 text-gray-700' // Gray background for user messages
                  : 'bg-[rgb(100,102,255)] text-white' // Blue-purple background for Fungi messages
              }`}
              style={{ wordWrap: 'break-word', maxWidth: '80%' }} // Allow wrapping and set max width
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Input and Send Button */}
      <div className="flex items-center rounded-full border border-gray-300 bg-[rgb(100, 102, 255)] focus-within:ring-2 focus-within:ring-[rgb(78,80,231)] px-4 py-2"> {/* Updated background color */}
        <input
          type="text"
          className="flex-grow p-2 focus:outline-none bg-transparent"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 p-2 bg-[rgb(78,80,231)] text-white rounded-full hover:bg-[rgb(70,72,210)] transition-all duration-300"
          disabled={loading}
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
