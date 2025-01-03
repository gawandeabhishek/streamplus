import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { supabaseClient, REALTIME_EVENTS } from "@/lib/supabase-client";

export async function PATCH(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();

    // Database operation with Neon.tech
    const updatedRequest = await db.friend.update({
      where: {
        id: params.requestId,
      },
      data: { 
        status: status === 'accept' ? 'accepted' : 'rejected'
      }
    });

    // Realtime update with Supabase
    await supabaseClient
      .channel('friend_updates')
      .send({
        type: 'broadcast',
        event: REALTIME_EVENTS.FRIEND_REQUEST_UPDATE,
        payload: {
          requestId: params.requestId,
          senderId: updatedRequest.userId,
          receiverId: updatedRequest.friendId,
          status: status === 'accept' ? 'accepted' : 'rejected'
        }
      });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating friend request:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 