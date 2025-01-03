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

    const { friendId } = await req.json();

    const existingRequest = await db.friend.findFirst({
      where: {
        OR: [
          {
            userId: friendId,
            friendId: session.user.id,
            status: "pending"
          }
        ]
      }
    });

    if (!existingRequest) {
      return new NextResponse("Friend request not found", { status: 404 });
    }

    const updatedFriend = await db.friend.update({
      where: {
        id: existingRequest.id
      },
      data: {
        status: "accepted"
      }
    });

    // Create the reverse relationship
    await db.friend.create({
      data: {
        userId: session.user.id,
        friendId: friendId,
        status: "accepted"
      }
    });

    return NextResponse.json(updatedFriend);
  } catch (error) {
    console.error("[FRIEND_ACCEPT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 