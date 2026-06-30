import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const UpdateSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

// PATCH /api/connections/[id] — accept or reject
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = UpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Only the receiver can accept/reject
    if (connection.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status: result.data.status },
    });

    return NextResponse.json({ connection: updated });
  } catch (err) {
    console.error("Connection PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/connections/[id] — withdraw request
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Only sender can withdraw, only receiver can delete
    if (connection.senderId !== session.user.id && connection.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.connection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Connection DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
