import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const requests = await db.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: 'pending' },
          { friendId: session.user.id, status: 'pending' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    // Transform the data to show the correct user info
    const transformedRequests = requests.map(request => {
      const isOutgoing = request.userId === session.user.id;
      return {
        ...request,
        user: isOutgoing ? request.friend : request.user
      };
    });

    return NextResponse.json(transformedRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 