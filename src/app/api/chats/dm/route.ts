import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

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
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: userId } } },
        ],
      },
    });

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // Create new chat
    const chat = await db.chat.create({
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
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("[DM_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 