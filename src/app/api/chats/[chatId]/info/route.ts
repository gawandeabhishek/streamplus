import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id: params.chatId,
      },
      include: {
        initiator: true,
        receiver: true,
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const otherUser = conversation.userId === session.user.id 
      ? conversation.receiver 
      : conversation.initiator;

    // Get online status from Supabase presence
    const { data: presenceData } = await supabase
      .from('presence')
      .select('online_at')
      .eq('user_id', otherUser.id)
      .single();

    const isOnline = presenceData?.online_at 
      ? Date.now() - new Date(presenceData.online_at).getTime() < 5 * 60 * 1000 // Consider online if active in last 5 minutes
      : false;

    return NextResponse.json({
      name: otherUser.name || "Unknown User",
      memberCount: 2,
      isGroup: false,
      onlineStatus: isOnline
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 