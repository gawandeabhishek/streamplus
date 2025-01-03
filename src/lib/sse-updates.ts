export async function triggerSSEUpdate(type: 'friend_request' | 'friend_request_update' | 'friend_removed') {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/friends/sse`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  } catch (error) {
    console.error('Error triggering SSE update:', error);
  }
} 