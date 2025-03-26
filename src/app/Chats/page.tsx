'use client';

import Chat from '@/components/Chats';
import { useEffect, useState } from 'react';

export default function ChatsPage() {
  const [sender, setSender] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSender = localStorage.getItem('chat-username');
      const storedReceiver = localStorage.getItem('chat-receiver');
      const storedConversationId = localStorage.getItem('chat-convoId');

      if (storedSender && storedReceiver && storedConversationId) {
        setSender(storedSender);
        setReceiver(storedReceiver);
        setConversationId(storedConversationId);
      }
    }
  }, []);

  if (!sender || !receiver || !conversationId) {
    return <p>Loading chat...</p>; // or redirect or fallback logic
  }

  return (
    <Chat
      sender={sender}
      receiver={receiver}
      conversationId={conversationId}
    />
  );
}
