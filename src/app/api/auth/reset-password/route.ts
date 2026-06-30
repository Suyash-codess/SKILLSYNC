import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { passwordHash },
    });

    // Delete the token so it can't be reused
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id }
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
