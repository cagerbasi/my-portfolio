'use client';

import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

import { Button, Paper, Title, Box, Stack, Group, Text, Textarea, Tooltip } from '@mantine/core';
import { User } from '@/types/user';

const socket = io('http://localhost:5001');

interface ChatProps {
    sender: string;
    receiver: string;
    conversationId: string;
}

interface ChatMessage {
    conversationId: string;
    timestamp: number;
    sender: string;
    receiver: string;
    message: string;
}

const Chat = ({sender, receiver, conversationId}: ChatProps) => {
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [receiverDisplayName, setReceiverDisplayName] = useState('');

    const [typingUser, setTypingUser] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('chat-username');
            if (!user) {
                router.replace('/LoginSelect');
            }
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typingUser]);      

    useEffect(() => {
        const fetchReceiverName = async () => {
            try {
                const res = await fetch('http://localhost:5001/users');
                const data: { users: User[] } = await res.json();

                const user = data.users.find((u) => u.userId === receiver);
                if (user) setReceiverDisplayName(user.displayName);
            } catch (err) {
                console.error('Failed to fetch receiver info', err);
            }
        };
        
        fetchReceiverName();
    }, [receiver]);
      

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        
        const handleTyping = ({ conversationId: convo, sender: typingUserId }: { conversationId: string; sender: string }) => {
            if (convo === conversationId && typingUserId !== sender) {
            setTypingUser(typingUserId);
        
            clearTimeout(timeout); // Reset the timer
            timeout = setTimeout(() => {
                setTypingUser(null);
            }, 2000); // 2s of no input clears it
            }
        };
        
        socket.on('user-typing', handleTyping);
        
        return () => {
            socket.off('user-typing', handleTyping);
            clearTimeout(timeout); // Cleanup on unmount
        };
    }, [conversationId, sender]);

    useEffect(() => {
        const handleNewMessage = (msg: ChatMessage) => {
            if (msg.conversationId === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };
        
        socket.on('new-message', handleNewMessage);
    
        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [conversationId]);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            const res = await fetch(`http://localhost:5001/get-messages?conversationId=${conversationId}`);
            const data = await res.json();
            setMessages(data.messages || []);
        };

        fetchMessages();
    }, [conversationId]);

    // Send message
    const sendMessage = async () => {
        if (!message.trim()) return;

        setTypingUser(null);

        await fetch('http://localhost:5001/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, sender, receiver, message }),
        });

        setMessage('');

        const res = await fetch(`http://localhost:5001/get-messages?conversationId=${conversationId}`);
        const data = await res.json();
        setMessages(data.messages || []);
    };
      
    return (
        <Box
            style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            }}
        >
            <Box
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                }}
                >
                <Button
                    variant="light"
                    color="blue"
                    size="xs"
                    onClick={() => {
                        router.push('/ChatList');
                    }}
                >
                    Back
                </Button>
            </Box>

            <Box
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                }}
                >
                <Button
                    variant="light"
                    color="red"
                    size="xs"
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('chat-username');
                            localStorage.removeItem('chat-receiver');
                            localStorage.removeItem('chat-convoId');
                            router.replace('/LoginSelect')
                        }
                    }}
                >
                    Log Out
                </Button>
            </Box>

            <Paper
                shadow="md"
                radius="md"
                p="xl"
                withBorder
                style={{ width: '100%', maxWidth: 500 }}
            >
                <Title order={3} mb="md">
                    {receiverDisplayName || receiver}
                </Title>
            
                <Box
                    ref={scrollRef}
                    style={{
                        height: 240,
                        overflowY: 'scroll',
                        backgroundColor: '#e9ecef',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                    }}
                >
                    {messages.map((msg, i) => {
                        const isSender = msg.sender === sender;

                        return (
                            <Group
                                key={i}
                                justify={isSender ? 'flex-end' : 'flex-start'}
                                style={{ marginBottom: '0.5rem' }}
                            >
                                <Box
                                    p="sm"
                                    bg={isSender ? 'blue.6' : 'gray.2'}
                                    style={{
                                        borderRadius: '16px',
                                        maxWidth: '70%',
                                        color: isSender ? 'white' : 'black',
                                    }}
                                >
                                    <Text size="xs" fw={500} mb={4}>
                                        {isSender ? 'You' : msg.sender}
                                    </Text>

                                    <Text size="sm" mb={2}>
                                        {msg.message}
                                    </Text>

                                    <Text size="xs" c="dimmed" ta={isSender ? 'right' : 'left'}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </Box>
                            </Group>
                        );
                    })}

                    {typingUser && (
                        <Group justify="flex-start" mb="xs">
                            <Box
                                p="sm"
                                bg="gray.2"
                                style={{
                                    borderRadius: '16px',
                                    maxWidth: '60%',
                                    fontStyle: 'italic',
                                    color: 'gray',
                                }}
                            >
                                <Text size="sm">{typingUser} is typing...</Text>
                            </Box>
                        </Group>
                    )}
                </Box>
            
                <Stack gap="sm">
                    <Textarea
                        placeholder="Drop some science here..."
                        value={message}
                        autosize
                        minRows={2}
                        maxRows={5}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            socket.emit('typing', {
                                conversationId,
                                sender,
                            });
                        }}
                        onKeyDown={(e) => {
                            const isCtrlOrCmdEnter = (e.ctrlKey || e.metaKey) && e.key === 'Enter';

                            if (isCtrlOrCmdEnter) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />

                    <Tooltip
                        label="(Just the) Tip: Press Ctrl+Enter or Cmd+Enter to send!"
                        withArrow
                        position="bottom-start"
                        offset={4}
                        openDelay={2000}
                    >
                        <Button fullWidth onClick={sendMessage}>
                            Send
                        </Button>
                    </Tooltip>

                </Stack>
            </Paper>
        </Box>
    );
}    

export default Chat;
