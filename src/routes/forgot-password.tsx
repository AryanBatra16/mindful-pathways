import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthButton } from "@/components/AuthShell";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Mind2Care" }] }),
  component: Forgot,
});

function Forgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("A gentle reset link has been sent to your email!");
      setTimeout(() => {
        navigate({ to: "/signin" });
      }, 1500);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send a gentle reset link to your inbox"
      footer={<>Remembered? <Link to="/signin" className="text-primary font-medium">Sign in</Link></>}
      onSubmit={handleSubmit}
    >
      <AuthInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <AuthButton>Send Reset Link</AuthButton>
    </AuthShell>
  );
}
