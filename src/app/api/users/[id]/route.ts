import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProfileUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id] — get a single user profile
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const currentUserId = session.user?.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        college: true,
        major: true,
        year: true,
        bio: true,
        avatarUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        linkedinUrl: true,
        isAvailable: true,
        showEmail: true,
        showPhone: true,
        email: true,
        phone: true,
        createdAt: true,
        skills: {
          select: { skill: { select: { id: true, name: true, category: true } } },
        },
        // Check connection status
        sentConnections: {
          where: { receiverId: currentUserId },
          select: { status: true },
        },
        receivedConnections: {
          where: { senderId: currentUserId },
          select: { status: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine connection status
    const connectionFromMe = user.receivedConnections[0];
    const connectionToMe = user.sentConnections[0];
    const isConnected =
      connectionFromMe?.status === "ACCEPTED" ||
      connectionToMe?.status === "ACCEPTED";

    // Privacy: hide contact if not connected and user hasn't enabled public visibility
    const responseUser = {
      ...user,
      email: isConnected || user.showEmail ? user.email : null,
      phone: isConnected || user.showPhone ? user.phone : null,
      skills: user.skills.map((s) => s.skill),
      connectionStatus: connectionFromMe?.status ?? connectionToMe?.status ?? null,
      connectionDirection: connectionFromMe ? "received" : connectionToMe ? "sent" : null,
      sentConnections: undefined,
      receivedConnections: undefined,
    };

    return NextResponse.json({ user: responseUser });
  } catch (err) {
    console.error("User GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/users/[id] — update own profile
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (session.user?.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = ProfileUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { skillIds, ...profileData } = result.data;

    const updateData: Record<string, unknown> = { ...profileData };

    // Update skills if provided
    if (skillIds !== undefined) {
      updateData.skills = {
        deleteMany: {},
        create: skillIds.map((skillId) => ({ skillId })),
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, college: true, major: true,
        year: true, bio: true, avatarUrl: true, githubUrl: true,
        portfolioUrl: true, linkedinUrl: true, isAvailable: true,
        showEmail: true, showPhone: true,
        skills: { select: { skill: { select: { id: true, name: true, category: true } } } },
      },
    });

    return NextResponse.json({
      user: { ...user, skills: user.skills.map((s) => s.skill) },
    });
  } catch (err) {
    console.error("User PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
