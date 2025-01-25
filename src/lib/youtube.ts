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

interface OEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  html: string;
}

export async function getVideoDetails(videoId: string) {
  const response = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  );
  
  if (!response.ok) throw new Error('Video not found');
  const data: OEmbedResponse = await response.json();

  return {
    title: data.title,
    channelTitle: data.author_name,
    channelUrl: data.author_url,
    thumbnail: data.thumbnail_url,
    embedHtml: data.html,
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
  try {
    // For trending videos (when no query)
    const baseUrl = query 
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      : 'https://www.youtube.com/feed/trending';

    const response = await fetch(baseUrl);
    const html = await response.text();

    // Extract video IDs using a more reliable regex pattern
    const videoMatches = html.match(/"videoId":"([^"]*)"/g) || [];
    const videoIds = Array.from(new Set(
      videoMatches
        .map(match => match.split('"')[3])
        .filter(Boolean)
    )).slice(0, 24);

    console.log('Found video IDs:', videoIds); // Debug log

    // Fetch details for each video using oEmbed
    const videos = await Promise.all(
      videoIds.map(async (id) => {
        try {
          const embedResponse = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
          );
          
          if (!embedResponse.ok) throw new Error(`Failed to fetch video ${id}`);
          
          const data = await embedResponse.json();
          return {
            id,
            title: data.title,
            thumbnail: {
              url: data.thumbnail_url,
              width: 1280,
              height: 720
            },
            channelTitle: data.author_name,
            publishedAt: new Date().toISOString(),
            viewCount: 'N/A'
          };
        } catch (error) {
          console.error(`Error fetching video ${id}:`, error);
          return null;
        }
      })
    );

    return videos.filter(Boolean) as YouTubeVideo[];
  } catch (error) {
    console.error('Error in getYouTubeVideos:', error);
    return [];
  }
}

const OEMBED_ENDPOINT = "https://www.youtube.com/oembed";
const YOUTUBE_API_ENDPOINT = "https://www.youtube.com";

export async function getVideoData(videoId: string) {
  const response = await fetch(
    `${OEMBED_ENDPOINT}?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch video data');
  }

  const data = await response.json();
  return {
    title: data.title,
    author_name: data.author_name,
    author_url: data.author_url,
    thumbnail_url: data.thumbnail_url,
    html: data.html,
  };
}

export async function getChannelData(channelId: string) {
  const response = await fetch(
    `${OEMBED_ENDPOINT}?url=https://www.youtube.com/channel/${channelId}&format=json`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch channel data');
  }

  return await response.json();
} 