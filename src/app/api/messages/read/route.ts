import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId } = await req.json();

    if (!senderId) {
      return NextResponse.json({ error: "Missing senderId" }, { status: 400 });
    }

    // Mark all unread messages from this sender to the current user as read
    await prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
