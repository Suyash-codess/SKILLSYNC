import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, college, major, year } = result.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, passwordHash, college, major, year },
      select: { id: true, name: true, email: true, college: true, major: true, year: true },
    });

    const { generateVerificationToken } = await import("@/lib/tokens");
    const { sendVerificationEmail } = await import("@/lib/mail");

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    return NextResponse.json({ user, message: "Verification email sent" }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
