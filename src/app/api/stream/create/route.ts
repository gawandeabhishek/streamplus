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

    const { friendId, videoId } = await req.json();

    const stream = await db.stream.create({
      data: {
        videoId,
        isLive: true,
        startedAt: new Date(),
        participants: {
          create: [
            { userId: session.user.id },
            { userId: friendId }
          ]
        }
      }
    });

    return NextResponse.json(stream);
  } catch (error) {
    console.error("[STREAM_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 