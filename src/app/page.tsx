'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If we already have session info, go straight to chats
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('chat-username');
      const convo = localStorage.getItem('chat-convoId');

      if (user && convo) {
        router.push('/chats');
      } else {
        router.push('/LoginSelect');
      }
    }
  }, [router]);

  return null; // Could also show a splash screen or loading animation
}
