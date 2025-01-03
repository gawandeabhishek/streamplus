import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { friendId } = await req.json();

    // Check for existing conversation
    const existingConversation = await db.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [
              { userId: session.user.id },
              { friendId: friendId }
            ]
          },
          {
            AND: [
              { userId: friendId },
              { friendId: session.user.id }
            ]
          }
        ]
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation if none exists
    const conversation = await db.conversation.create({
      data: {
        userId: session.user.id,
        friendId: friendId,
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}