import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chat = await db.chat.findUnique({
      where: {
        id: params.chatId,
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      },
    });

    if (!chat || !chat.isGroup) {
      return new NextResponse("Invalid operation", { status: 400 });
    }

    // Check if user has friends in the group
    const friendsInGroup = await db.friend.findMany({
      where: {
        userId: session.user.id,
        friendId: {
          in: chat.members.map(member => member.userId).filter(id => id !== session.user.id)
        },
        status: "accepted"
      }
    });

    if (friendsInGroup.length > 0) {
      return new NextResponse(
        "You must remove friends from the group before leaving", 
        { status: 400 }
      );
    }

    // Delete the member from the chat
    await db.chatMember.delete({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId: params.chatId,
        },
      },
    });

    // If this was the last member, delete the chat
    if (chat.members.length === 1) {
      await db.chat.delete({
        where: {
          id: params.chatId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAT_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 