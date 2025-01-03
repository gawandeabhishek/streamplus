import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { supabaseClient, REALTIME_EVENTS } from "@/lib/supabase-client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { friendId } = await req.json();

    if (session.user.id === friendId) {
      return new NextResponse("Cannot send friend request to yourself", { status: 400 });
    }

    // Database operation with Neon.tech
    const friend = await db.friend.create({
      data: {
        userId: session.user.id,
        friendId: friendId,
        status: 'pending'
      }
    });

    // Realtime update with Supabase
    console.log('Sending realtime update...');
    await supabaseClient
      .channel('friend_updates')
      .send({
        type: 'broadcast',
        event: REALTIME_EVENTS.FRIEND_REQUEST,
        payload: {
          senderId: session.user.id,
          receiverId: friendId,
          status: 'pending'
        }
      });
    console.log('Realtime update sent');

    return NextResponse.json(friend);
  } catch (error) {
    console.error("Error creating friend request:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friends = await db.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: 'accepted' },
          { friendId: session.user.id, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    // Transform the data to return the correct user info
    const transformedFriends = friends.map(friend => {
      const isUserFriend = friend.userId === session.user.id;
      return isUserFriend ? friend.friend : friend.user;
    });

    console.log('Fetched friends for user:', session.user.id, transformedFriends);

    return NextResponse.json(transformedFriends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { friendId } = await req.json();

    // Delete only the pending request
    await db.friend.deleteMany({
      where: {
        userId: session.user.id,
        friendId: friendId,
        status: "pending"
      }
    });

    // Broadcast to both users
    await Promise.all([
      supabaseClient.channel(`friends:${session.user.id}`).send({
        type: 'broadcast',
        event: 'friend_request_cancelled',
        payload: { userId: session.user.id, friendId }
      }),
      supabaseClient.channel(`friends:${friendId}`).send({
        type: 'broadcast',
        event: 'friend_request_cancelled',
        payload: { userId: session.user.id, friendId }
      })
    ]);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 