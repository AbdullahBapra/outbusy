import { redirect } from "next/navigation";
import { AuthCard } from "@/components/admin/AuthCard";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { link } = await searchParams;

  return (
    <AuthCard title="Team sign in" subtitle="Inbox, leads, knowledge base and blog.">
      {link === "expired" && (
        <p className="mt-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">That link has expired or was already used. Sign in, or request a new reset link.</p>
      )}
      <LoginForm />
    </AuthCard>
  );
}
