import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotForm } from "@/components/admin/ForgotForm";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthCard title="Reset password" subtitle="We'll email you a link to choose a new one.">
      <ForgotForm />
    </AuthCard>
  );
}
