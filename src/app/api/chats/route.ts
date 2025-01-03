import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { friendId: session.user.id }
        ]
      },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!db) {
    console.error("Database connection not initialized");
    return new NextResponse("Database Error", { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { friendId } = await req.json();
    
    if (!friendId) {
      return new NextResponse("Friend ID is required", { status: 400 });
    }

    if (friendId === session.user.id) {
      return new NextResponse("Cannot create chat with yourself", { status: 400 });
    }

    const existingConversation = await db.conversation.findFirst({
      where: {
        OR: [
          { AND: [{ userId: session.user.id }, { friendId }] },
          { AND: [{ userId: friendId }, { friendId: session.user.id }] }
        ]
      },
      include: {
        initiator: true,
        receiver: true
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    const conversation = await db.conversation.create({
      data: {
        userId: session.user.id,
        friendId,
      },
      include: {
        initiator: true,
        receiver: true
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("[CONVERSATION_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 