// app/page.tsx

import ChatWindow from '../components/ChatWindow';
import { ChatProvider } from '../context/ChatContext';

export default function Home() {
  return (
    <ChatProvider>
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
