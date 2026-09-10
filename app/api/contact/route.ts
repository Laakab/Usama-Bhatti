import { NextRequest, NextResponse } from "next/server";

const FORMSPREE_URL = "https://formspree.io/f/xaeyavbk";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body as Record<string, string>;

    // Basic server-side validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Server calls Formspree — no CORS, no browser restrictions
    const formData = new FormData();
    formData.append("name",     name.trim());
    formData.append("email",    email.trim());
    formData.append("_subject", `Portfolio Contact: ${subject.trim()}`);
    formData.append("subject",  subject.trim());
    formData.append("message",  message.trim());
    formData.append("_replyto", email.trim());

    const res = await fetch(FORMSPREE_URL, {
      method:  "POST",
      headers: { Accept: "application/json" },
      body:    formData,
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (data as { error?: string }).error || "Formspree rejected the request." },
      { status: res.status }
    );
  } catch (err) {
    console.error("[contact route]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
