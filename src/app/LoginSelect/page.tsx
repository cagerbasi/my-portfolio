'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginSelect from '@/components/LoginSelect';

export default function LoginSelectPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');

  return (
    <LoginSelect
      onLogin={(uid: string) => {
        setUserId(uid);
        localStorage.setItem('chat-username', uid);
        router.push('/ChatList');
      }}
    />
  );
}
