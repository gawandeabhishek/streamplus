import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First check if chat exists
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
      console.log("Chat not found:", params.chatId);
      return new NextResponse("Chat not found", { status: 404 });
    }

    // Find other participant
    const otherParticipant = chat.participants.find(
      p => p.user.id !== session.user.id
    );

    if (!otherParticipant) {
      console.log("Other participant not found in chat:", params.chatId);
      return new NextResponse("Participant not found", { status: 404 });
    }

    return NextResponse.json({
      id: otherParticipant.user.id,
      name: otherParticipant.user.name,
      image: otherParticipant.user.image
    });

  } catch (error) {
    console.error("[CHAT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 