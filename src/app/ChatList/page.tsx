'use client';

import ChatList from '@/components/ChatList';
import { useRouter } from 'next/navigation';

const ChatListPage = () => {
    const router = useRouter();
    const currentUserId = localStorage.getItem('chat-username');

    const handleSelect = (userId: string) => {
        const conversationId = [currentUserId, userId].sort().join('-');
        localStorage.setItem('chat-receiver', userId);
        localStorage.setItem('chat-convoId', conversationId);
        router.push('/Chats');
    };

    return (
        <ChatList currentUserId={currentUserId!} onSelect={handleSelect} />
    );
};

export default ChatListPage;
