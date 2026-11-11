import { Resend } from "resend";
import { brand } from "@/content/brand";

/**
 * Transactional email (team invites, password resets, chat alerts) via Resend.
 * Needs RESEND_API_KEY and ALERT_FROM_EMAIL (an address on a domain verified in Resend).
 */

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.ALERT_FROM_EMAIL);

let client: Resend | null = null;

export async function sendEmail(msg: { to: string | string[]; subject: string; html: string; text: string }) {
  if (!isEmailConfigured()) {
    console.warn(`[email] Not configured (RESEND_API_KEY / ALERT_FROM_EMAIL). Skipped "${msg.subject}" to ${String(msg.to)}.`);
    return false;
  }
  client ??= new Resend(process.env.RESEND_API_KEY);
  const { error } = await client.emails.send({ from: `${brand.name} <${process.env.ALERT_FROM_EMAIL}>`, ...msg });
  if (error) {
    console.error("[email] send failed:", error.message);
    return false;
  }
  return true;
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** A plain, on-brand email body: heading, paragraphs and one button. */
export function emailLayout({ heading, lines, button }: { heading: string; lines: string[]; button?: { label: string; href: string } }) {
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#040404">
  <div style="font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#00897a">${esc(brand.name)}</div>
  <h1 style="font-size:22px;margin:12px 0 16px">${esc(heading)}</h1>
  ${lines.map((l) => `<p style="font-size:15px;line-height:1.6;color:#3a4042;margin:0 0 12px">${esc(l)}</p>`).join("")}
  ${button ? `<p style="margin:24px 0"><a href="${esc(button.href)}" style="background:#040404;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:600">${esc(button.label)}</a></p>` : ""}
  <p style="font-size:12px;color:#8a8f91;margin-top:32px">Sent by the ${esc(brand.name)} admin panel.</p>
</div>`;
  const text = [heading, "", ...lines, ...(button ? ["", `${button.label}: ${button.href}`] : [])].join("\n");
  return { html, text };
}
