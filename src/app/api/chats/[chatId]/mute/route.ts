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

    const { muted } = await req.json();

    const updatedMember = await db.chatMember.update({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId: params.chatId,
        },
      },
      data: {
        isMuted: muted,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("[CHAT_MUTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 