import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    // Inspect session cookie or active state in browser/server context
    if (typeof window !== "undefined") {
      const hasSession = document.cookie.includes("session_active=true");
      if (!hasSession) {
        throw redirect({ to: "/signin" });
      }
    }
  },
  component: AppLayout,
});
