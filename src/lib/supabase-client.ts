import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Create a reusable channel
export const friendsChannel = supabaseClient.channel('friend_updates', {
  config: {
    broadcast: { self: true },
    presence: { key: 'friend_updates' },
  }
})

export const REALTIME_EVENTS = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_UPDATE: 'friend_request_update',
  FRIEND_REMOVED: 'friend_removed'
} as const