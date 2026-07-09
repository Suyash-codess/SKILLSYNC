import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

// The Outfit font provides a clean, modern aesthetic for the entire application
const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillSync — Find Your Dream Team",
  description:
    "The localized skill-barter platform for engineering students. Connect with teammates who have complementary skills for hackathons, contests, and startups.",
  keywords: ["hackathon", "team", "students", "skills", "networking", "coding"],
  authors: [{ name: "SkillSync" }],
  openGraph: {
    title: "SkillSync — Find Your Dream Team",
    description: "Connect with engineering students who have the skills you need.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}><Providers>{children}</Providers></body>
    </html>
  );
}
