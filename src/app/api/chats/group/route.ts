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
    console.log("Creating group with:", { name, memberIds, userId: session.user.id }); // Debug log

    if (!name || !memberIds?.length) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const chat = await db.chat.create({
      data: {
        name,
        isGroup: true,
        members: {
          create: [
            {
              userId: session.user.id,
              isAdmin: true,
            },
            ...memberIds.map((id: string) => ({
              userId: id,
              isAdmin: false,
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("Created chat:", chat); // Debug log
    return NextResponse.json(chat);

  } catch (error) {
    console.error("[CREATE_GROUP_CHAT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 