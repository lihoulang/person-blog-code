'use client';

import Messaging from '@/components/chat/Messaging';
import { useAuth } from '@/context/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return <Messaging userId={String(user.id)} />;
} 