import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function generateVerificationToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour from now

  // Delete any existing token for this email
  const existingToken = await prisma.verificationToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: { id: existingToken.id }
    });
  }

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return verificationToken;
}

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour from now

  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id }
    });
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return passwordResetToken;
}
