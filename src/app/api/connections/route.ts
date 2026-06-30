import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ConnectionSchema } from "@/lib/validations";

// POST /api/connections — send connection request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = ConnectionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { receiverId, message } = result.data;
    const senderId = session.user.id;

    // Can't send to yourself
    if (senderId === receiverId) {
      return NextResponse.json(
        { error: "You cannot send a connection request to yourself" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if connection already exists in either direction
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json({ error: "Already connected" }, { status: 409 });
      }
      if (existing.status === "PENDING") {
        return NextResponse.json({ error: "Request already pending" }, { status: 409 });
      }
      // If REJECTED, allow retry by updating
      const updated = await prisma.connection.update({
        where: { id: existing.id },
        data: { status: "PENDING", message, senderId, receiverId },
      });
      return NextResponse.json({ connection: updated }, { status: 200 });
    }

    const connection = await prisma.connection.create({
      data: { senderId, receiverId, message },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (err) {
    console.error("Connections POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/connections — get all connections for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [received, sent] = await Promise.all([
      prisma.connection.findMany({
        where: { receiverId: userId },
        include: {
          sender: {
            select: {
              id: true, name: true, college: true, major: true,
              avatarUrl: true, isAvailable: true,
              skills: { select: { skill: { select: { name: true, category: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.connection.findMany({
        where: { senderId: userId },
        include: {
          receiver: {
            select: {
              id: true, name: true, college: true, major: true,
              avatarUrl: true, isAvailable: true,
              skills: { select: { skill: { select: { name: true, category: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      received: received.map((c) => ({
        ...c,
        sender: { ...c.sender, skills: c.sender.skills.map((s) => s.skill) },
      })),
      sent: sent.map((c) => ({
        ...c,
        receiver: { ...c.receiver, skills: c.receiver.skills.map((s) => s.skill) },
      })),
    });
  } catch (err) {
    console.error("Connections GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
