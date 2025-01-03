import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const count = await db.friend.count({
      where: {
        friendId: session.user.id,
        status: 'pending'
      }
    });

    console.log('Pending requests count for user:', session.user.id, count);
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending count:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 