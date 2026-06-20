"use client";

import { useUser } from "@/context/authContext";
import { ReactNode } from "react";

type RoleGateProps = {
  allow: ("manager" | "worker")[];
  children: ReactNode;
  fallback?: ReactNode; // optional: show something else if not allowed
};

// Renders children only if the logged-in user's role is in `allow`.
// Example: <RoleGate allow={["manager"]}><CreateTaskButton /></RoleGate>
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { user, loading } = useUser();

  if (loading) return null; // or a spinner, if you prefer
  if (!user || !allow.includes(user.role)) return <>{fallback}</>;

  return <>{children}</>;
}