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

    const { friendIds } = await req.json();

    // Get friends who are mutual friends with all selected friends
    const mutualFriends = await db.friend.findMany({
      where: {
        AND: [
          { userId: session.user.id },
          { status: "accepted" },
          {
            friendId: {
              in: await db.friend.findMany({
                where: {
                  AND: friendIds.map((id: string) => ({
                    userId: id,
                    status: "accepted"
                  }))
                },
                select: {
                  friendId: true
                }
              }).then(friends => friends.map(f => f.friendId))
            }
          }
        ]
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    const formattedFriends = mutualFriends.map(f => ({
      id: f.friend.id,
      name: f.friend.name,
      image: f.friend.image
    }));

    return NextResponse.json(formattedFriends);
  } catch (error) {
    console.error("[MUTUAL_FRIENDS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 