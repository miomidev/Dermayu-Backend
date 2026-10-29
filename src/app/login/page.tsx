"use client";

import { usePathname } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";

export default function LoginPage() {
  const pathname = usePathname();
  return <AuthCard key={pathname} initialMode="login" />;
}

