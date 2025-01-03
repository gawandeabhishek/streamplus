import { supabase } from "./supabase";

export const createFriendsChannel = (userId: string) => {
  return supabase.channel(`friends:${userId}`, {
    config: {
      broadcast: { self: true },
    },
  });
}; 