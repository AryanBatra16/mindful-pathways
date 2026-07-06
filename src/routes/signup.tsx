import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthButton } from "@/components/AuthShell";
import { useState } from "react";
import { useApp } from "@/lib/state";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — Mind2Care" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const hasSession = document.cookie.includes("session=");
      if (hasSession) {
        throw redirect({ to: "/dashboard" });
      }
    }
  },
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const { updateProfile } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      updateProfile({ name, email });
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <AuthShell
      title="Begin your journey"
      subtitle="A calmer mind starts with a single mindful step"
      footer={<>Already have an account? <Link to="/signin" className="text-primary font-medium">Sign in</Link></>}
      onSubmit={handleSubmit}
    >
      <AuthInput label="Full name" placeholder="Aria Wells" value={name} onChange={(e) => setName(e.target.value)} required />
      <AuthInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <AuthInput label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <AuthButton>Create Account</AuthButton>
    </AuthShell>
  );
}
