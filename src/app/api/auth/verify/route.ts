import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const existingToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Token does not exist" }, { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Email does not exist" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        // Just in case they somehow change email in the future
        email: existingToken.email,
      }
    });

    await prisma.verificationToken.delete({
      where: { id: existingToken.id }
    });

    // Redirect to login page with a success query param
    return NextResponse.redirect(new URL("/login?verified=true", req.url));

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
