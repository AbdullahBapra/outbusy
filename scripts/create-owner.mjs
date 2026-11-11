// Creates (or promotes) the first owner account for the admin panel.
//
//   node --env-file=.env.local scripts/create-owner.mjs you@company.com "Your Name"
//
// Prints a one-time link: open it in your browser to choose your password. The password is
// never typed into the terminal or stored anywhere but Supabase Auth.
import { createClient } from "@supabase/supabase-js";

const [email, ...nameParts] = process.argv.slice(2);
const fullName = nameParts.join(" ").trim();
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: node --env-file=.env.local scripts/create-owner.mjs you@company.com "Your Name"');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run with --env-file=.env.local).");
  process.exit(1);
}
const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const lower = email.toLowerCase();

// Find the auth user, or invite (create) them.
let userId;
let hashedToken;
const invite = await db.auth.admin.generateLink({ type: "invite", email: lower });
if (invite.error) {
  // Already registered: issue a recovery link instead.
  const recovery = await db.auth.admin.generateLink({ type: "recovery", email: lower });
  if (recovery.error) {
    console.error("Could not create or find the user:", recovery.error.message);
    process.exit(1);
  }
  userId = recovery.data.user.id;
  hashedToken = recovery.data.properties.hashed_token;
} else {
  userId = invite.data.user.id;
  hashedToken = invite.data.properties.hashed_token;
}

const { error } = await db
  .from("profiles")
  .upsert({ id: userId, email: lower, full_name: fullName || lower.split("@")[0], role: "owner", active: true }, { onConflict: "id" });
if (error) {
  console.error("Could not save the owner profile:", error.message);
  process.exit(1);
}

const type = invite.error ? "recovery" : "invite";
console.log(`\nOwner ready: ${lower}`);
console.log("Open this link within an hour to choose your password (make sure the dev server is running):\n");
console.log(`${site}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=${type}&next=/admin/set-password\n`);
