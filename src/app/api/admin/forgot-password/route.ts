import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { BASE_URL } from '@/lib/constants';

// Configure SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials missing in .env');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    const resetUrl = `${BASE_URL}/admin/reset-password/${resetToken}`;

    // Send email
    try {
      await transporter.sendMail({
        from: `"Eagle Revolution" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Password Reset Request - Eagle Revolution',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2430d2; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Password Reset</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
                You requested a password reset for your Eagle Revolution Admin account. Click the button below to set a new password. This link will expire in 1 hour.
              </p>
              <a href="${resetUrl}" style="background-color: #2430d2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Reset My Password
              </a>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 40px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
    } catch (mailError: any) {
      console.error('Nodemailer Error:', mailError);
      return NextResponse.json({ error: 'Failed to send reset email: ' + mailError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });

  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
