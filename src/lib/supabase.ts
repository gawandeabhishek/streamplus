import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Type for real-time message payload
export interface RealtimeMessage {
  id: string;
  content: string;
  chat_id: string;
  sender_id: string;
  created_at: string;
  metadata?: {
    type: string;
    videoId: string;
    senderId: string;
    senderName: string;
  };
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
} 