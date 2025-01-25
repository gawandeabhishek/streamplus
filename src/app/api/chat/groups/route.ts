import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, participantIds } = await request.json();

    const chat = await db.chat.create({
      data: {
        name,
        isGroup: true,
        participants: {
          create: [
            { userId: session.user.id, isAdmin: true },
            ...participantIds.map((id: string) => ({
              userId: id,
              isAdmin: false,
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({ chatId: chat.id });
  } catch (error) {
    console.error("[GROUPS_POST]", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to create group" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 