"use client";

import { useState, useEffect } from "react";

interface Chat {
  id: string;
  name: string;
  image?: string;
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  unreadCount: number;
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch chats from your API
    const fetchChats = async () => {
      try {
        // Replace with your API call
        const response = await fetch('/api/chats');
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return { chats, loading };
} 