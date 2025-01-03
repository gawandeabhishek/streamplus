import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse("User ID required", { status: 400 });
    }

    // Check if chat already exists
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
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // Create new chat
    const newChat = await db.chat.create({
      data: {
        isGroup: false,
        participants: {
          createMany: {
            data: [
              { userId: session.user.id },
              { userId: userId }
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