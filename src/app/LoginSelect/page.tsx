'use client';

import { useRouter } from 'next/navigation';
import LoginSelect from '@/components/LoginSelect';

export default function LoginSelectPage() {
  const router = useRouter();

  return (
    <LoginSelect
      onLogin={(uid: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat-username', uid);
        }
        router.push('/ChatList');
      }}
    />
  );
}
