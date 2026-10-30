"use client";

import React from "react";
import { DashboardShell, type DashboardShellProps } from "@/components/dashboard/DashboardShell";

export interface DashboardLayoutProps extends Partial<DashboardShellProps> {
  role?: "warga" | "petugas";
  title?: string;
  pageTitle?: string;
  userName?: string;
  userRoleLabel?: string;
  userLocation?: string;
  children: React.ReactNode;
}

/**
 * @deprecated Gunakan Root Layout Next.js bawaan (src/app/warga/layout.tsx dan src/app/petugas/layout.tsx).
 * Komponen ini dipertahankan hanya untuk backward compatibility.
 */
export function DashboardLayout({
  role = "warga",
  children,
}: DashboardLayoutProps) {
  return <>{children}</>;
}
