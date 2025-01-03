import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function getYoutubeClient() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('User not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { accounts: true }
  });

  if (!user?.accounts[0]) {
    throw new Error('No linked Google account found');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );

  const { access_token, refresh_token, expires_at } = user.accounts[0];
  const hasTokenExpired = expires_at ? expires_at * 1000 < Date.now() : true;

  if (hasTokenExpired && refresh_token) {
    try {
      oauth2Client.setCredentials({
        refresh_token: refresh_token
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update the database with new tokens
      await prisma.account.update({
        where: { id: user.accounts[0].id },
        data: {
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : undefined,
          refresh_token: credentials.refresh_token ?? refresh_token
        }
      });

      oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Instead of throwing, try using the existing access token
      oauth2Client.setCredentials({
        access_token: access_token,
        refresh_token: refresh_token
      });
    }
  } else {
    oauth2Client.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token
    });
  }

  return google.youtube({ version: 'v3', auth: oauth2Client });
}

export async function getVideoDetails(videoId: string) {
  const youtube = await getYoutubeClient();
  const response = await youtube.videos.list({
    id: [videoId],
    part: ['snippet', 'statistics'],
  });

  const video = response.data.items?.[0];
  if (!video) throw new Error('Video not found');

  return {
    title: video.snippet?.title,
    description: video.snippet?.description,
    channelTitle: video.snippet?.channelTitle,
    channelImage: `https://youtube.com/avatar/${video.snippet?.channelId}`,
    publishedAt: video.snippet?.publishedAt,
    viewCount: video.statistics?.viewCount,
    likeCount: video.statistics?.likeCount,
    commentCount: video.statistics?.commentCount,
  };
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
}

export async function getYouTubeVideos(query?: string): Promise<YouTubeVideo[]> {
  const youtube = await getYoutubeClient();
  const response = await youtube.search.list({
    q: query || '',
    part: ['snippet'],
    maxResults: 24,
    type: ['video'],
  });

  return response.data.items?.map((item) => ({
    id: item.id?.videoId ?? '',
    title: item.snippet?.title ?? 'Untitled',
    thumbnail: {
      url: item.snippet?.thumbnails?.high?.url ?? '',
      width: item.snippet?.thumbnails?.high?.width ?? 1280,
      height: item.snippet?.thumbnails?.high?.height ?? 720
    },
    channelTitle: item.snippet?.channelTitle ?? 'Unknown Channel',
    publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
    viewCount: '0'
  })) || [];
} 