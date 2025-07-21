import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

// Set your Resend API key in your environment as RESEND_API_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// ---- POST /api/contact ----
// Body: { name: string, email: string, message: string }
export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. RBAC (must have 'contact' feature)
  const features = await getUserFeatures(user.id);
  if (!features.includes('contact')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // 3. Parse and validate input
  let body: { name?: string; email?: string; message?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: 'Message is too short.' }, { status: 400 });
  }
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email provider not configured.' }, { status: 500 });
  }

  // 4. Send Email (using Resend's test sender for now)
  const mailPayload = {
    from: 'onboarding@resend.dev',                // Use until your domain is verified
    to: 'developer@lotteryanalytics.app',         // Recipient (you)
    subject: 'New Contact Form Submission (LotteryAnalytics)',
    reply_to: email,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message
    ].join('\n')
  };

  const mailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mailPayload)
  });

  if (!mailRes.ok) {
    const errText = await mailRes.text();
    return NextResponse.json({ error: 'Failed to send email', detail: errText }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
