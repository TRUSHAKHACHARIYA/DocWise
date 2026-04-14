import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create a transporter
// In production, you'd use a real SMTP server or an API like Resend
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'password',
  },
});

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify your DocWise account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Welcome to DocWise, ${name}!</h2>
        <p>Thank you for signing up. Please verify your email address to get started.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If the button above doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    if (env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      // Create Ethereal account if no SMTP host provided in dev
      const testAccount = await nodemailer.createTestAccount();
      const devTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      const info = await devTransporter.sendMail(mailOptions);
      console.log('Verification email sent (Dev): %s', nodemailer.getTestMessageUrl(info));
      return info;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};
