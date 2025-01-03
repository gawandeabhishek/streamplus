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

    const { name, memberIds } = await req.json();

    if (!name || !memberIds?.length) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Create group chat with participants
    const chat = await db.chat.create({
      data: {
        name,
        isGroup: true,
        participants: {
          createMany: {
            data: [
              { userId: session.user.id, isAdmin: true },
              ...memberIds.map((id: string) => ({
                userId: id,
                isAdmin: false
              }))
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
    console.error("[GROUP_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 