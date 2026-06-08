import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthButton } from "@/components/AuthShell";
import { useState } from "react";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — Mind2Care" }] }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your wellness journey"
      footer={<>New here? <Link to="/signup" className="text-primary font-medium">Create an account</Link></>}
      onSubmit={handleSubmit}
    >
      <AuthInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <AuthInput label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <div className="text-right -mt-2">
        <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
      </div>
      <AuthButton>Sign In</AuthButton>
    </AuthShell>
  );
}
