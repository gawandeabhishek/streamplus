import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { videoId, title, thumbnail, type } = await req.json();

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      videoId,
      title,
      thumbnail,
      type,
    },
  });

  return NextResponse.json(activity);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const activities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  return NextResponse.json(activities);
} 