import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/skills — fetch all skills for profile edit
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
