import { AuthCard } from "@/components/admin/AuthCard";
import { SetPasswordForm } from "@/components/admin/SetPasswordForm";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Choose a password" };

/** Reached from an invite or reset email (the link signs the member in first). */
export default async function SetPasswordPage() {
  const member = await requireAdmin();
  return (
    <AuthCard title="Choose a password" subtitle={`For ${member.email}. At least 12 characters, with letters and numbers.`}>
      <SetPasswordForm />
    </AuthCard>
  );
}
