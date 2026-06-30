import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  college: z
    .string()
    .min(2, "College name required")
    .max(100)
    .trim(),
  major: z
    .string()
    .min(2, "Major required")
    .max(80)
    .trim(),
  year: z.enum(["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "PhD"], {
    message: "Please select a valid year",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2).max(60).trim().optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").trim().optional(),
  college: z.string().min(2).max(100).trim().optional(),
  major: z.string().min(2).max(80).trim().optional(),
  year: z
    .enum(["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "PhD"])
    .optional(),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  showPhone: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  skillIds: z.array(z.string().cuid()).optional(),
});

export const ProjectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100).trim(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000)
    .trim(),
  type: z.enum(["Hackathon", "Contest", "Startup", "Research", "Open Source"]),
  techStack: z
    .array(z.string().max(50).trim())
    .min(1, "Add at least one technology")
    .max(15),
  neededSkills: z
    .array(z.string().max(50).trim())
    .min(1, "Add at least one needed skill")
    .max(10),
  teamSize: z.number().int().min(2).max(20),
  deadline: z.string().datetime().optional().or(z.literal("")),
});

export const ConnectionSchema = z.object({
  receiverId: z.string().cuid("Invalid user ID"),
  message: z
    .string()
    .max(300, "Message must be under 300 characters")
    .trim()
    .optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type ConnectionInput = z.infer<typeof ConnectionSchema>;
