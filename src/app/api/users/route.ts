import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProfileUpdateSchema } from "@/lib/validations";

// GET /api/users — searchable directory
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const skill = searchParams.get("skill") ?? "";
    const college = searchParams.get("college") ?? "";
    const available = searchParams.get("available");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      id: { not: session.user?.id }, // Exclude self
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { major: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }
    if (college) {
      where.college = { contains: college, mode: "insensitive" };
    }
    if (available === "true") {
      where.isAvailable = true;
    }
    if (skill) {
      where.skills = {
        some: { skill: { name: { contains: skill, mode: "insensitive" } } },
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          skills: {
            select: {
              skill: { select: { id: true, name: true, category: true } },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        skills: u.skills.map((s) => s.skill),
      })),
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (err) {
    console.error("Users GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
