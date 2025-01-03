import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import linkifyIt from 'linkify-it';

const linkify = new linkifyIt();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(number: number): string {
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(number);
}

export function extractYouTubeVideoId(text: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function extractVideoId(text: string): string | null {
  const watchPattern = new RegExp(`${BASE_URL}/watch\\?v=([^\\s&]+)`);
  const match = text.match(watchPattern);
  return match ? match[1] : null;
}

export async function getVideoDetails(videoId: string) {
  try {
    const response = await fetch(`/api/videos/${videoId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

export function extractWatchVideoId(text: string): string | null {
  const watchUrlPattern = /(?:localhost:3000|your-domain\.com)\/watch\/([a-zA-Z0-9_-]+)/;
  const match = text.match(watchUrlPattern);
  return match ? match[1] : null;
}

export function formatViews(views: string | number): string {
  const num = typeof views === 'string' ? parseInt(views) : views;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
