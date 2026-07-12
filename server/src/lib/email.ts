import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Create Email Transporter config
export const transporter = nodemailer.createTransport({
  service: "gmail", // or your email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email app password
  },
});

interface SendInvitationEmailParams {
  to: string;
  inviteLink: string;
  role: "manager" | "worker";
  organizationName?: string;
}

/**
 * Sends an organization invitation email to a prospective member.
 * Throws if the SMTP delivery fails; callers decide how to handle it.
 */
export const sendInvitationEmail = async ({
  to,
  inviteLink,
  role,
  organizationName,
}: SendInvitationEmailParams) => {
  const orgName = organizationName?.trim() || "a team";
  const atIndex = to.indexOf("@");
  const recipientName = atIndex > 0 ? to.slice(0, atIndex) : to;

  const subject = `You're invited to join ${orgName} on FieldForce`;

  const text = [
    `Hi ${recipientName},`,
    "",
    `You've been invited to join ${orgName} as a ${role} on FieldForce.`,
    "",
    "Click the link below to set up your account and get started:",
    inviteLink,
    "",
    "If you weren't expecting this invitation, you can safely ignore this email.",
    "",
    "— The FieldForce Team",
  ].join("\n");

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
    <h2 style="margin-bottom: 4px;">You're invited to FieldForce</h2>
    <p style="color: #4b5563; margin-top: 0;">
      Hi ${recipientName}, you've been invited to join
      <strong>${orgName}</strong> as a <strong>${role}</strong>.
    </p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${inviteLink}"
        style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 600;">
        Accept invitation
      </a>
    </p>
    <p style="color: #6b7280; font-size: 13px;">
      Or copy and paste this link into your browser:<br />
      <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="color: #9ca3af; font-size: 12px;">
      If you weren't expecting this invitation, you can safely ignore this email.
    </p>
  </div>`;

  await transporter.sendMail({
    from: `"FieldForce" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
