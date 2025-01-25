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

    const { requestId } = await req.json();

    // First find the request
    const request = await db.friend.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return new NextResponse("Request not found", { status: 404 });
    }

    // Update the request status
    const updatedRequest = await db.friend.update({
      where: { id: requestId },
      data: { status: "accepted" }
    });

    // Create bi-directional friendship
    await db.friend.create({
      data: {
        userId: request.friendId,
        friendId: request.userId,
        status: "accepted"
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("[FRIEND_ACCEPT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 