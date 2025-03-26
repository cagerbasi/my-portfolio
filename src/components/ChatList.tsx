'use client'

import { User } from "@/types/user";
import { Avatar, Box, Button, Group, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { useRouter } from 'next/navigation';

interface ChatListProps {
    currentUserId: string;
    onSelect: (userId: string) => void;
}

const ChatList = ({currentUserId, onSelect}: ChatListProps) => {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem('chat-username');
        if (!user) {
            router.replace('/LoginSelect');
        }
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('http://localhost:5001/users');
                const data = await res.json();
                setUsers(data.users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

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
                    right: 20,
                }}
            >
                <Button
                    variant="light"
                    color="red"
                    size="xs"
                    onClick={() => {
                        localStorage.removeItem('chat-username');
                        localStorage.removeItem('chat-receiver');
                        localStorage.removeItem('chat-convoId');
                        router.replace('/LoginSelect')
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
                <Stack>
                    <Title order={3}>Select a chat</Title>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <Paper key={index} p="sm" radius="md" withBorder>
                                    <Group>
                                    <Skeleton height={40} circle />
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        <Skeleton height={10} width="60%" />
                                        <Skeleton height={8} width="40%" />
                                    </Stack>
                                    </Group>
                                </Paper>
                              ))
                        ) : (
                            users
                            .filter((u) => u.userId !== currentUserId)
                            .map((user) => (
                                <Paper
                                    key={user.userId}
                                    p="sm"
                                    radius="md"
                                    withBorder
                                    onClick={() => onSelect(user.userId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Group>
                                        <Avatar src={user.avatar} radius="xl" />
                                        <div>
                                        <Text>{user.displayName}</Text>
                                        <Text size="xs" c="dimmed">
                                            {user.status}
                                        </Text>
                                        </div>
                                    </Group>
                                </Paper>
                            ))
                        )}
                </Stack>
            </Paper>
        </Box>
    );
}

export default ChatList;