"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AuthProvider } from "@/lib/auth-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="pl-[200px]">
          <AppHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
