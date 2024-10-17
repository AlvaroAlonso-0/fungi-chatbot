// components/ChatWindow.tsx
"use client";

import { useChat } from '../context/ChatContext';
import { useState, useEffect, useRef, Fragment } from 'react';
import Image from 'next/image';
import { FiSend } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Spinner icon
import logo from '../public/logo.jpg';

const ChatWindow = () => {
  const { messages, addMessage } = useChat();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // General error for API issues
  const chatEndRef = useRef<HTMLDivElement | null>(null); // Reference to track the end of chat
  const welcomeSent = useRef(false); // Use ref to track if the welcome message is sent

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage = { id: Date.now(), text: input, role: 'user' as const };
    addMessage(userMessage);

    // Clear input, start loading, reset errors
    setInput('');
    setLoading(true);
    setError(null); // Reset error state

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Debugging

      if (response.ok) {
        // Check for unknown command in the response
        if (data.reply === 'Unknown command') {
          const botMessage = { id: Date.now(), text: "I didn't understand that command. Please try again!", role: 'bot' as const };
          addMessage(botMessage);
        } else {
          const botMessage = { id: Date.now(), text: data.reply, role: 'bot' as const };
          addMessage(botMessage);
        }
      } else {
        // Set error message for backend issues
        setError('There was an error communicating with the backend. Please try again later.');
      }

    } catch (error) {
      setError('There was an error communicating with the backend. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Send a welcome message when the chat window loads, only if it hasn't been sent yet
    if (!welcomeSent.current) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Welcome to Fungi DeFi! I'm here to help you explore Ethereum blockchain data and the world of decentralized finance. Whether you want to check the latest Ethereum stats or gain insights into DeFi protocols, I'm here to assist you. Type "help" anytime if you need guidance. Let's start unlocking DeFi knowledge together!`,
        role: 'bot' as const,
      };
      addMessage(welcomeMessage);
      welcomeSent.current = true; // Mark the welcome message as sent
    }
  }, [addMessage]); // Remove `welcomeSent` from dependencies

  return (
    <div className="p-8 w-[700px] mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* Logo */}
      <div className="mb-4 flex justify-start">
        <Image src={logo} alt="Logo" width={50} height={50} className="rounded-full" />
      </div>

      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto mb-6 p-6 bg-gray-50 rounded-lg chat-window">
        {messages.map((msg) => (
          <div key={msg.id} className="my-6 text-left">
            <div className="text-sm text-gray-500 mb-1">
              {msg.role === 'user' ? 'You' : 'Fungi'}
            </div>
            <div
              className={`inline-block p-4 rounded-3xl ${
                msg.role === 'user'
                  ? 'bg-gray-200 text-gray-700' // Gray background for user messages
                  : 'bg-[rgb(100,102,255)] text-white' // Blue-purple background for Fungi messages
              }`}
              style={{ wordWrap: 'break-word', maxWidth: '80%' }}
            >
              {/* Convert \n to <br /> for proper line breaks */}
              {msg.text.split('\n').map((line, index) => (
                <Fragment key={index}>
                  {line}
                  <br />
                </Fragment>
              ))}
            </div>
          </div>
        ))}
        {/* Auto-scroll reference */}
        <div ref={chatEndRef} />
      </div>
      {/* General error message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Input and Send Button */}
      <div className="flex items-center rounded-full border border-gray-300 bg-[rgb(100, 102, 255)] focus-within:ring-2 focus-within:ring-[rgb(78,80,231)] px-4 py-2">
        <input
          type="text"
          className="flex-grow p-2 focus:outline-none bg-transparent"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()} // Prevent sending while loading
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 p-2 bg-[rgb(78,80,231)] text-white rounded-full hover:bg-[rgb(70,72,210)] transition-all duration-300"
          disabled={loading}
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin" size={20} />
          ) : (
            <FiSend size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
