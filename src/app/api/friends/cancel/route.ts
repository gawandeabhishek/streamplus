import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { supabaseClient } from "@/lib/supabase-client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { requestId } = await req.json();
    
    const request = await db.friend.findFirst({
      where: {
        id: requestId,
        userId: session.user.id,
        status: 'pending'
      }
    });

    if (!request) {
      return new NextResponse("Request not found", { status: 404 });
    }

    await db.friend.delete({
      where: {
        id: requestId
      }
    });

    // Broadcast the cancel event
    await supabaseClient.channel('friend_updates').send({
      type: 'broadcast',
      event: 'friend_request',
      payload: {
        type: 'cancelled',
        requestId,
        userId: session.user.id
      }
    });

    return new NextResponse("OK");
  } catch (error) {
    console.error("Error canceling friend request:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 