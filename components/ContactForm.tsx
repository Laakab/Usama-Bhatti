"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Replace the value below with your Formspree endpoint ID.

   How to get it (free, 50 submissions/month):
   1. Go to https://formspree.io and sign up / log in
   2. Click "New Form" → name it "Portfolio Contact"
   3. Copy the endpoint — it looks like:  https://formspree.io/f/xxxxxxxx
   4. Paste ONLY the ID part (e.g. "xxxxxxxx") as FORMSPREE_ID below
   5. On first submission Formspree will send you a confirmation email
─────────────────────────────────────────────────────────────── */
const FORMSPREE_ID = "https://formspree.io/f/xaeyavbk"; // ← replace this

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FieldError {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function validate(fields: FormState): FieldError {
  const errors: FieldError = {};
  if (!fields.name.trim())        errors.name    = "Name is required.";
  if (!fields.email.trim())       errors.email   = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                  errors.email   = "Please enter a valid email address.";
  if (!fields.subject.trim())     errors.subject = "Subject is required.";
  if (!fields.message.trim())     errors.message = "Message is required.";
  return errors;
}

export default function ContactForm() {
  const [fields, setFields] = useState<FormState>({
    name: "", email: "", subject: "", message: "",
  });
  const [errors,  setErrors]  = useState<FieldError>({});
  const [status,  setStatus]  = useState<"idle" | "sending" | "success" | "error">("idle");
  const [apiError, setApiError] = useState("");

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    // clear field error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const fieldErrors = validate(fields);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    fields.name,
          email:   fields.email,
          subject: fields.subject,
          message: fields.message,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setFields({ name: "", email: "", subject: "", message: "" });
        setErrors({});
      } else {
        setApiError(
          (data as { error?: string }).error ||
          "Something went wrong. Please try again."
        );
        setStatus("error");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setApiError("Unable to send message. Please email me directly at usama.developer.500@gmail.com");
      setStatus("error");
    }
  };

  const inputBase =
    "w-full rounded-lg border bg-transparent px-4 py-3 font-body text-sm text-paper placeholder:text-fog/50 focus:outline-none transition-colors";
  const inputNormal = `${inputBase} border-line focus:border-fog`;
  const inputInvalid = `${inputBase} border-red-500/70 focus:border-red-400`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Contact form" noValidate>

      {/* Name + Email row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-name" className="font-body text-xs text-fog">Name</label>
          <input
            id="cf-name"
            type="text"
            placeholder="Your name"
            value={fields.name}
            onChange={set("name")}
            className={errors.name ? inputInvalid : inputNormal}
            aria-describedby={errors.name ? "cf-name-err" : undefined}
          />
          {errors.name && (
            <p id="cf-name-err" className="font-body text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-email" className="font-body text-xs text-fog">Email</label>
          <input
            id="cf-email"
            type="email"
            placeholder="you@email.com"
            value={fields.email}
            onChange={set("email")}
            className={errors.email ? inputInvalid : inputNormal}
            aria-describedby={errors.email ? "cf-email-err" : undefined}
          />
          {errors.email && (
            <p id="cf-email-err" className="font-body text-xs text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-subject" className="font-body text-xs text-fog">Subject</label>
        <input
          id="cf-subject"
          type="text"
          placeholder="Project type"
          value={fields.subject}
          onChange={set("subject")}
          className={errors.subject ? inputInvalid : inputNormal}
          aria-describedby={errors.subject ? "cf-subject-err" : undefined}
        />
        {errors.subject && (
          <p id="cf-subject-err" className="font-body text-xs text-red-400">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-message" className="font-body text-xs text-fog">Message</label>
        <textarea
          id="cf-message"
          rows={5}
          placeholder="Tell me about your project…"
          value={fields.message}
          onChange={set("message")}
          className={`resize-none ${errors.message ? inputInvalid : inputNormal}`}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
        />
        {errors.message && (
          <p id="cf-message-err" className="font-body text-xs text-red-400">{errors.message}</p>
        )}
      </div>

      {/* API error */}
      {status === "error" && apiError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400">
          {apiError}
        </p>
      )}

      {/* Success message */}
      {status === "success" && (
        <div className="flex items-start gap-3 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3">
          <span className="mt-0.5 text-signal">✓</span>
          <p className="font-body text-sm text-paper">
            Message sent successfully! I&apos;ll get back to you soon.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "sending"}
        className="self-start rounded-full border border-line px-6 py-3 font-body text-sm text-paper
                   transition-colors hover:border-paper hover:bg-line/30
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? (
          <span className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Sending…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Mail size={14} aria-hidden />
            Send message
          </span>
        )}
      </button>
    </form>
  );
}
