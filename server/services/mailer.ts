import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const from = process.env.SMTP_FROM || 'Hamro BCA <no-reply@hamrobca.edu.np>';

  // If SMTP is not configured, log clearly and provide fallback info
  if (!host || !user || !pass) {
    console.log(`[Email Service (SMTP Pending)] To: ${to} | Subject: "${subject}"`);
    return {
      success: true,
      delivered: false,
      message: 'SMTP credentials not configured. Verification / reset links handled directly on server.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });

    console.log(`[Email Service] Sent email to ${to} (MessageId: ${info.messageId})`);
    return { success: true, delivered: true, messageId: info.messageId };
  } catch (error: any) {
    console.warn(`[Email Service] Failed to send email via SMTP:`, error.message);
    return { success: false, delivered: false, error: error.message };
  }
}
