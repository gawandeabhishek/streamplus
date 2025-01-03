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

    const friends = await db.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { friendId: session.user.id }
        ]
      }
    });

    const friendStates: Record<string, 'none' | 'pending' | 'accepted'> = {};
    
    friends.forEach(friend => {
      const otherId = friend.userId === session.user.id ? friend.friendId : friend.userId;
      friendStates[otherId] = friend.status as 'pending' | 'accepted';
    });

    return NextResponse.json(friendStates);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 