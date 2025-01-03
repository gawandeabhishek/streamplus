import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
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
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        }
      }
    });

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    // Find the other participant (for non-group chats)
    const otherParticipant = chat.participants.find(
      p => p.userId !== session.user.id
    )?.user;

    if (!otherParticipant) {
      return new NextResponse("Participant not found", { status: 404 });
    }

    return NextResponse.json(otherParticipant);
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 