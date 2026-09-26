import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../services/dbStore.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/index.js';
import { sendEmail } from '../services/mailer.js';

export const authRouter = Router();

// Register: strictly role: 'student'
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(422).json({
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
      return;
    }

    const { name, email, password, semester } = parseResult.data;

    // Check duplicate email
    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user strictly with role: 'student'
    const newUser = await db.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'student', // Never allows privilege escalation from public registration
      semester: semester || 1,
      emailVerified: null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      status: 'active',
    });

    // Generate secure email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await db.createToken(email, verificationToken, 'email_verification', 24);

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    // Dispatch email
    await sendEmail({
      to: email,
      subject: 'Verify your Hamro BCA Student Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Welcome to Hamro BCA, ${name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Thank you for registering on Hamro BCA academic portal. Please verify your email address to unlock your full BCA syllabus notes, past papers, and enrolled courses.
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/><span style="color: #2563eb;">${verifyUrl}</span></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">This link will expire in 24 hours.</p>
        </div>
      `,
    });

    const safeUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      semester: newUser.semester,
      emailVerified: newUser.emailVerified,
    };

    const token = generateToken(safeUser as any);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Registration successful! Verification email has been sent.',
      user: safeUser,
      token,
      verificationToken, // included for easy development/testing when SMTP is pending
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { email, password } = parseResult.data;
    const user = await db.findUserByEmail(email);

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account has been deactivated. Please contact campus admin.' });
      return;
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      semester: user.semester,
      emailVerified: user.emailVerified,
    };

    const token = generateToken(safeUser as any);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// Logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get Current Logged-in User
authRouter.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const user = await db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password, ...safe } = user;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user session' });
  }
});

// Verify Email
authRouter.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: 'Verification token is required.' });
      return;
    }

    const email = await db.verifyAndConsumeToken(token, 'email_verification');
    if (!email) {
      res.status(400).json({ error: 'Invalid or expired verification token.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User associated with token not found.' });
      return;
    }

    await db.updateUser(user._id.toString(), { emailVerified: new Date() });

    res.json({
      success: true,
      message: 'Email address verified successfully. Thank you!',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify email.' });
  }
});

// Forgot Password: NEVER reveal whether email exists
authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Valid email address is required.' });
      return;
    }

    const { email } = parseResult.data;
    const user = await db.findUserByEmail(email);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await db.createToken(email, resetToken, 'password_reset', 2); // 2 hours expiry

      const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: email,
        subject: 'Reset your Hamro BCA Password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for Hamro BCA. Click the button below to choose a new password.
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">This link will expire in 2 hours.</p>
          </div>
        `,
      });
    }

    // Always return identical message to prevent user enumeration
    res.json({
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error processing password reset.' });
  }
});

// Reset Password
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(422).json({
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
      return;
    }

    const { token, password } = parseResult.data;
    const email = await db.verifyAndConsumeToken(token, 'password_reset');

    if (!email) {
      res.status(400).json({ error: 'Invalid or expired password reset link.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User no longer exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.updateUser(user._id.toString(), { password: hashedPassword });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error during password update.' });
  }
});
