export interface Friend {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  type: 'text' | 'watch_invite';
} 