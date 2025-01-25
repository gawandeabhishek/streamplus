import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const requests = await db.friend.findMany({
      where: {
        OR: [
          {
            userId: session.user.id,
            status: "pending"
          },
          {
            friendId: session.user.id,
            status: "pending"
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 