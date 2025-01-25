import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { supabaseClient, REALTIME_EVENTS } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    // Check if users exist
    const [currentUser, friendUser] = await Promise.all([
      db.user.findUnique({ where: { id: session.user.id } }),
      db.user.findUnique({ where: { id: friendId } })
    ]);

    if (!currentUser || !friendUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if friend request already exists
    const existingRequest = await db.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: friendId },
          { userId: friendId, friendId: session.user.id }
        ]
      }
    });

    if (existingRequest) {
      return new NextResponse("Friend request already exists", { status: 400 });
    }

    // Create friend request
    const friendRequest = await db.friend.create({
      data: {
        userId: session.user.id,
        friendId: friendId,
        status: 'pending'
      }
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error("Error creating friend request:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friends = await db.friend.findMany({
      where: {
        OR: [
          {
            userId: session.user.id,
            status: "accepted"
          },
          {
            friendId: session.user.id,
            status: "accepted"
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(friends);
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