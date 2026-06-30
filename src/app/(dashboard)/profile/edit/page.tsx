import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import EditProfileClient from "./EditProfileClient";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { skills: { include: { skill: true } } },
  });

  if (!user) redirect("/login");

  const allSkills = await prisma.skill.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <EditProfileClient user={user} allSkills={allSkills} />
    </div>
  );
}
