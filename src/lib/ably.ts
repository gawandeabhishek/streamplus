import * as Ably from 'ably';

export const ably = new Ably.Realtime.Promise({
  key: process.env.ABLY_API_KEY,
});

export const publishMessage = async (channelId: string, eventName: string, data: any) => {
  const channel = ably.channels.get(channelId);
  await channel.publish(eventName, data);
}; 