'use client'

import { Box, Button, Loader, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import ChatList from "@/components/ChatList";
import { User } from "@/types/user";

import { useRouter } from "next/navigation";

interface LoginSelectProps {
    onLogin: (userId: string) => void;
}
  
  const LoginSelect = ({ onLogin }: LoginSelectProps) => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [step]);

    const checkUser = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5001/users');
            const data = await res.json();

            const user = (data.users as User[]).find((u) => u.userId === username.trim())

            if (user) {
                setUserId(user.userId);
                setStep(2);
            } else {
                setError('Sorry, this user was not found.')
            }
        } catch {
            setError('Ruh roh! Failed to fetch users!');
        }  finally {
            setLoading(false);
        }
    }

    const handlePassword = () => {
        setStep(3);
        localStorage.setItem('chat-username', userId);
        onLogin(userId);
    }

    return (
        <Box
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Box style={{ width: '100%', maxWidth: 400 }}>
                {step === 1 && (
                    <Box
                        component="form"
                        onSubmit={(e) => {
                        e.preventDefault();
                        checkUser();
                        }}
                    >
                        <Stack>
                            <Title order={2} ta="center">
                                Welcome!
                            </Title>
                
                            <TextInput
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.currentTarget.value)}
                                error={error}
                                required
                                ref={inputRef}
                            />
                
                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? <Loader size="xs" /> : 'Continue'}
                            </Button>
                        </Stack>
                    </Box>
                )}
        
                {step === 2 && (
                    <Box
                        component="form"
                        onSubmit={(e) => {
                        e.preventDefault();
                        handlePassword();
                        }}
                    >
                        <Stack>
                            <Title order={3} ta="center">
                                Hi {userId}!
                            </Title>
                
                            <PasswordInput 
                                placeholder="Enter your password" 
                                required 
                                ref={inputRef}
                            />
                
                            <Button type="submit" fullWidth>
                                Log in
                            </Button>
                        </Stack>
                    </Box>
                )}
        
                {step === 3 && (
                    <Stack>
                        <Title order={2} ta="center">
                            Hello, {userId}!
                        </Title>
                        
                        <Text ta="center">Choose a chat to begin messaging.</Text>
            
                        <ChatList
                            currentUserId={userId}
                            onSelect={(receiverId) => {
                                const sorted = [userId, receiverId].sort();
                                const conversationId = `${sorted[0]}-${sorted[1]}`;
                                localStorage.setItem('chat-username', userId);
                                localStorage.setItem('chat-receiver', receiverId);
                                localStorage.setItem('chat-convoId', conversationId);
                                router.push('/Chats');
                            }}
                        />
                    </Stack>
                )}
            </Box>
        </Box>
      );
}

export default LoginSelect;