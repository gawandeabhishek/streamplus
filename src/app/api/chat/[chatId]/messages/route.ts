import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messages = await db.message.findMany({
      where: {
        chatId: params.chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();
    
    // First create in Prisma
    const message = await db.message.create({
      data: {
        content,
        chatId: params.chatId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Then insert into Supabase with correct types
    const supabaseData = {
      id: message.id.toString(), // Ensure string type
      content: message.content,
      chat_id: params.chatId.toString(), // Ensure string type
      sender_id: session.user.id.toString(), // Ensure string type
      created_at: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id.toString(), // Ensure string type
        name: message.sender.name,
        image: message.sender.image
      }
    };

    console.log('Inserting into Supabase:', supabaseData);

    const { error, data } = await supabase
      .from('messages')
      .insert([supabaseData])
      .select('*')
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log('Supabase insert successful:', data);

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 