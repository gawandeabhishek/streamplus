import { usePresence } from "@/components/providers/presence-provider";

export function useOnlineStatus(userId?: string) {
  const { onlineUsers } = usePresence();
  
  if (!userId) return false;
  
  return onlineUsers.some(user => user.user_id === userId);
} 