import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  college: z.string().min(2, "College name too short").optional(),
  major: z.string().min(2, "Major name too short").optional(),
  year: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  portfolioUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  isAvailable: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      const issues: Record<string, string[]> = {};
      for (const err of result.error.issues) {
        const key = String(err.path[0]);
        if (!issues[key]) issues[key] = [];
        issues[key].push(err.message);
      }
      return NextResponse.json({ error: "Invalid fields", issues }, { status: 400 });
    }

    const data = result.data;

    // Build the data object dynamically based on what was provided
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.college !== undefined) updateData.college = data.college;
    if (data.major !== undefined) updateData.major = data.major;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
    if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
    if (data.portfolioUrl !== undefined) updateData.portfolioUrl = data.portfolioUrl;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

    // Handle skills update if provided
    if (data.skills !== undefined) {
      // Find valid skill IDs first
      const validSkills = await prisma.skill.findMany({
        where: { id: { in: data.skills } },
        select: { id: true }
      });
      
      const skillIds = validSkills.map(s => s.id);
      
      updateData.skills = {
        deleteMany: {}, // Remove all existing connections
        create: skillIds.map(id => ({ skillId: id })) // Create new ones
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
