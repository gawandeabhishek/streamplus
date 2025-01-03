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

    // First, find all non-group chats between these users
    const directChats = await db.chat.findMany({
      where: {
        isGroup: false,
        AND: [
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          },
          {
            members: {
              some: {
                userId: friendId
              }
            }
          }
        ]
      },
      include: {
        members: true
      }
    });

    // Delete all direct chat members and chats
    await Promise.all(
      directChats.map(async (chat) => {
        await db.chatMember.deleteMany({
          where: {
            chatId: chat.id
          }
        });
        
        await db.chat.delete({
          where: {
            id: chat.id
          }
        });
      })
    );

    // Delete friend relationship in both directions
    await db.friend.deleteMany({
      where: {
        OR: [
          { 
            userId: session.user.id,
            friendId: friendId,
          },
          {
            userId: friendId,
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