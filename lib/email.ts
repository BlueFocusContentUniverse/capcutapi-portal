import nodemailer from "nodemailer";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Godaddy",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type SendOTPEmailOptions = {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
};

export async function sendOTPEmail({ email, otp, type }: SendOTPEmailOptions) {
  const subject =
    type === "forget-password"
      ? "Password Reset OTP"
      : type === "email-verification"
        ? "Email Verification OTP"
        : "Sign In OTP";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">${subject}</h2>
      <p style="color: #666; font-size: 16px;">Your verification code is:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: "hello@koxagent.com",
    to: email,
    subject,
    html,
  });
}
