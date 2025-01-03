import { Server } from "socket.io";
import { NextResponse } from "next/server";
import type { NextApiResponseServerIO } from "@/types/socket";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      socket.on("join-chat", (chatId: string) => {
        socket.join(chatId);
      });
      
      socket.on("leave-chat", (chatId: string) => {
        socket.leave(chatId);
      });
    });

    return new NextResponse("Socket initialized", { status: 200 });
  } catch (error) {
    console.error("Socket Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 