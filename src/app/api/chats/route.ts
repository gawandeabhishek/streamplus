import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chats = await db.chat.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("[CHATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { friendId } = await req.json();
    
    if (!friendId) {
      return new NextResponse("Friend ID is required", { status: 400 });
    }

    // Check for existing chat
    const existingChat = await db.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            participants: {
              some: {
                userId: session.user.id
              }
            }
          },
          {
            participants: {
              some: {
                userId: friendId
              }
            }
          }
        ]
      }
    });

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // Create new chat
    const newChat = await db.chat.create({
      data: {
        participants: {
          createMany: {
            data: [
              { userId: session.user.id },
              { userId: friendId }
            ]
          }
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(newChat);
  } catch (error) {
    console.error("[CHAT_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 