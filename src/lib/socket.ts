import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const subscribeToChat = (chatId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on('broadcast', { event: 'message' }, ({ payload }) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

export const sendMessage = async (chatId: string, message: any) => {
  await supabase
    .channel(`chat:${chatId}`)
    .send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });
}; 