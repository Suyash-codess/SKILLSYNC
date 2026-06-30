import nodemailer from "nodemailer";

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

const isEmailConfigured = Boolean(SMTP_EMAIL && SMTP_PASSWORD);

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `http://localhost:3000/api/auth/verify?token=${token}`;

  if (isEmailConfigured) {
    try {
      await transporter.sendMail({
        from: `"SkillSync" <${SMTP_EMAIL}>`,
        to: email,
        subject: "Verify your SkillSync Account",
        html: `
          <h2>Welcome to SkillSync!</h2>
          <p>Click the link below to verify your email address:</p>
          <a href="${confirmLink}">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${confirmLink}</p>
        `,
      });
      console.log(`📧 REAL EMAIL SENT to ${email}`);
      return;
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  }

  // Fallback to console if real email fails or isn't configured
  console.log("=========================================");
  console.log("📧 MOCK EMAIL SENT (Fallback)");
  console.log(`To: ${email}`);
  console.log(`Subject: Verify your SkillSync Account`);
  console.log(`\nPlease click the link below to verify your email:\n`);
  console.log(confirmLink);
  console.log("=========================================");
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  if (isEmailConfigured) {
    try {
      await transporter.sendMail({
        from: `"SkillSync" <${SMTP_EMAIL}>`,
        to: email,
        subject: "Reset your SkillSync Password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetLink}</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
      console.log(`📧 REAL EMAIL SENT to ${email}`);
      return;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  // Fallback to console if real email fails or isn't configured
  console.log("=========================================");
  console.log("📧 MOCK EMAIL SENT (Fallback)");
  console.log(`To: ${email}`);
  console.log(`Subject: Reset your SkillSync Password`);
  console.log(`\nPlease click the link below to reset your password:\n`);
  console.log(resetLink);
  console.log("=========================================");
}
