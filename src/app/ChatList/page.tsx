'use client';

import ChatList from '@/components/ChatList';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ChatListPage = () => {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chat-username');
      if (!stored) {
        router.replace('/LoginSelect');
      } else {
        setCurrentUserId(stored);
      }
    }
  }, [router]);

  const handleSelect = (userId: string) => {
    const conversationId = [currentUserId, userId].sort().join('-');
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-receiver', userId);
      localStorage.setItem('chat-convoId', conversationId);
    }
    router.push('/Chats');
  };

  if (!currentUserId) return <p>Loading chat list...</p>;

  return (
    <ChatList currentUserId={currentUserId} onSelect={handleSelect} />
  );
};

export default ChatListPage;
