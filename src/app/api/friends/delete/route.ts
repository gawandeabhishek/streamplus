import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { supabaseClient, REALTIME_EVENTS } from "@/lib/supabase-client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { friendId } = await req.json();

    // Database operation with Neon.tech
    await db.friend.deleteMany({
      where: {
        OR: [
          { userId: session.user.id, friendId: friendId },
          { userId: friendId, friendId: session.user.id }
        ]
      }
    });

    // Realtime update with Supabase
    await supabaseClient
      .channel('friend_updates')
      .send({
        type: 'broadcast',
        event: REALTIME_EVENTS.FRIEND_REMOVED,
        payload: {
          senderId: session.user.id,
          receiverId: friendId
        }
      });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 