import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProjectSchema } from "@/lib/validations";

// GET /api/projects
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type");
    const skill = searchParams.get("skill");
    const openOnly = searchParams.get("open") !== "false";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (openOnly) where.isOpen = true;
    if (type) where.type = type;
    if (skill) {
      where.neededSkills = { has: skill };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true, name: true, college: true, major: true, avatarUrl: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (err) {
    console.error("Projects GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = ProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { deadline, ...rest } = result.data;

    const project = await prisma.project.create({
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : null,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, college: true, major: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("Projects POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
