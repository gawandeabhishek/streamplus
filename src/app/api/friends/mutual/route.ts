import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the selected friend ID from query params
    const { searchParams } = new URL(request.url);
    const selectedFriendId = searchParams.get('selectedFriendId');

    // If no friend is selected, return all friends
    if (!selectedFriendId) {
      const allFriends = await db.friend.findMany({
        where: {
          OR: [
            { userId: session.user.id, status: 'accepted' },
            { friendId: session.user.id, status: 'accepted' }
          ]
        }
      });

      const friendIds = Array.from(new Set(allFriends.flatMap(friend => 
        friend.userId === session.user.id ? [friend.friendId] : [friend.userId]
      )));

      const friends = await db.user.findMany({
        where: {
          id: {
            in: friendIds
          }
        },
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      });

      return NextResponse.json(friends);
    }

    // If a friend is selected, find mutual friends
    const userFriends = await db.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: 'accepted' },
          { friendId: session.user.id, status: 'accepted' }
        ]
      }
    });

    const selectedFriendFriends = await db.friend.findMany({
      where: {
        OR: [
          { userId: selectedFriendId, status: 'accepted' },
          { friendId: selectedFriendId, status: 'accepted' }
        ]
      }
    });

    // Get user's friend IDs
    const userFriendIds = new Set(userFriends.flatMap(friend => 
      friend.userId === session.user.id ? [friend.friendId] : [friend.userId]
    ));

    // Get selected friend's friend IDs
    const selectedFriendIds = new Set(selectedFriendFriends.flatMap(friend => 
      friend.userId === selectedFriendId ? [friend.friendId] : [friend.userId]
    ));

    // Find mutual friend IDs
    const mutualFriendIds = Array.from(userFriendIds).filter(id => 
      selectedFriendIds.has(id) && 
      id !== session.user.id && 
      id !== selectedFriendId
    );

    // Get mutual friend details
    const mutualFriends = await db.user.findMany({
      where: {
        id: {
          in: mutualFriendIds
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true
      }
    });

    return NextResponse.json(mutualFriends);
  } catch (error) {
    console.error("[MUTUAL_FRIENDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 