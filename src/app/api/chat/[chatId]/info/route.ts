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
                email: true,
              }
            }
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

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    const otherParticipant = chat.participants.find(
      p => p.user.id !== session.user.id
    );

    return NextResponse.json({
      id: chat.id,
      isGroup: chat.isGroup,
      name: chat.isGroup ? chat.name : otherParticipant?.user.name,
      participants: chat.participants.map(p => ({
        id: p.user.id,
        name: p.user.name,
        image: p.user.image,
        email: p.user.email,
        isAdmin: p.isAdmin
      })),
      lastMessage: chat.messages[0]
    });

  } catch (error) {
    console.error("[CHAT_INFO_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 