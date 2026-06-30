import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SKILLS = [
  // Frontend
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Three.js", category: "Frontend" },
  // Backend
  { name: "Node.js", category: "Backend" },
  { name: "Express.js", category: "Backend" },
  { name: "Django", category: "Backend" },
  { name: "FastAPI", category: "Backend" },
  { name: "Go", category: "Backend" },
  { name: "Rust", category: "Backend" },
  { name: "Spring Boot", category: "Backend" },
  { name: "GraphQL", category: "Backend" },
  // AI/ML
  { name: "PyTorch", category: "AI/ML" },
  { name: "TensorFlow", category: "AI/ML" },
  { name: "LangChain", category: "AI/ML" },
  { name: "Computer Vision", category: "AI/ML" },
  { name: "NLP", category: "AI/ML" },
  { name: "Scikit-learn", category: "AI/ML" },
  { name: "Hugging Face", category: "AI/ML" },
  { name: "OpenAI API", category: "AI/ML" },
  // DevOps
  { name: "Docker", category: "DevOps" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "AWS", category: "DevOps" },
  { name: "GCP", category: "DevOps" },
  { name: "CI/CD", category: "DevOps" },
  { name: "Terraform", category: "DevOps" },
  // Mobile
  { name: "Flutter", category: "Mobile" },
  { name: "React Native", category: "Mobile" },
  { name: "Swift", category: "Mobile" },
  { name: "Kotlin", category: "Mobile" },
  // Database
  { name: "PostgreSQL", category: "Database" },
  { name: "MongoDB", category: "Database" },
  { name: "Redis", category: "Database" },
  { name: "MySQL", category: "Database" },
  { name: "Neo4j", category: "Database" },
  // Design
  { name: "Figma", category: "Design" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Motion Design", category: "Design" },
  // Other
  { name: "Blockchain", category: "Other" },
  { name: "IoT", category: "Other" },
  { name: "Embedded Systems", category: "Other" },
  { name: "Unity", category: "Other" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert skills
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log(`✓ Seeded ${SKILLS.length} skills`);

  // Demo users
  const hash = await bcrypt.hash("Demo@1234", 12);

  const demoUsers = [
    {
      name: "Priya Sharma",
      email: "priya@iitb.ac.in",
      college: "IIT Bombay",
      major: "Computer Science & Engineering",
      year: "1st Year",
      bio: "hey guys! just finished a bootcamp on React and literally looking for anyone to build projects with. I bring the snacks and terrible jokes to late night hackathons 🍕✨",
      githubUrl: "https://github.com",
      isAvailable: true,
      skills: ["React", "JavaScript", "Tailwind CSS"],
    },
    {
      name: "Arjun Mehta",
      email: "arjun@bits.ac.in",
      college: "BITS Pilani",
      major: "AI & Data Science",
      year: "2nd Year",
      bio: "kinda know python, trying to figure out pytorch right now. tbh I just need a frontend person who can make my ugly scripts look like a real app lol.",
      githubUrl: "https://github.com",
      isAvailable: true,
      skills: ["Python", "PyTorch", "FastAPI"],
    },
    {
      name: "Riya Patel",
      email: "riya@vit.ac.in",
      college: "VIT Vellore",
      major: "Information Technology",
      year: "3rd Year",
      bio: "tired of doing all the backend work while my teammates just do CSS 😭. Looking for serious people for the upcoming college fest hackathon. HMU!",
      isAvailable: false,
      skills: ["Node.js", "Express.js", "Docker", "AWS"],
    },
    {
      name: "Kiran Reddy",
      email: "kiran@nitw.ac.in",
      college: "NIT Warangal",
      major: "Electronics & Communication",
      year: "1st Year",
      bio: "total beginner here! trying to learn how to make discord bots. if someone wants to learn together let's team up 👾",
      isAvailable: true,
      skills: ["Python", "JavaScript"],
    },
  ];

  for (const u of demoUsers) {
    const { skills: userSkills, ...userData } = u;
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: { ...userData, passwordHash: hash },
    });

    // Link skills
    for (const skillName of userSkills) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (skill) {
        await prisma.userSkill.upsert({
          where: { userId_skillId: { userId: user.id, skillId: skill.id } },
          update: {},
          create: { userId: user.id, skillId: skill.id },
        }).catch(() => {});
      }
    }
  }

  console.log(`✓ Seeded ${demoUsers.length} demo users`);
  console.log("✅ Seeding complete! Demo password: Demo@1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
