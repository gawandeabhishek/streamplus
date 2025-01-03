import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('presence')
      .upsert({
        user_id: session.user.id,
        email: session.user.email,
        online_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Presence update error:', error);
      return new NextResponse('Error updating presence', { status: 500 });
    }

    return new NextResponse('OK');
  } catch (error) {
    console.error('Presence API error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('presence')
      .select('user_id, email')
      .not('online_at', 'is', null)
      .gte('online_at', new Date(Date.now() - 2 * 60 * 1000).toISOString());

    if (error) {
      console.error('Presence fetch error:', error);
      return new NextResponse('Error fetching presence', { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Presence API error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 