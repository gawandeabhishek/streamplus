import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { friendId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete friend relationship in both directions
    await db.friend.deleteMany({
      where: {
        OR: [
          { 
            userId: session.user.id,
            friendId: params.friendId,
          },
          {
            userId: params.friendId,
            friendId: session.user.id,
          }
        ]
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error removing friend:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 