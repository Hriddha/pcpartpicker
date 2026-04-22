"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

function SavedContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bookmark className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Sign in to view saved lists</h2>
        <p className="mb-6 text-muted-foreground">
          Create an account to save parts and builds for later
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saved Lists</h1>
        <p className="text-muted-foreground">Your bookmarked parts and builds</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Bookmark className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">No saved items yet</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Browse parts and click the bookmark icon to save items for later
          </p>
          <Link href="/parts">
            <Button>Browse Parts</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SavedPage() {
  return (
    <DashboardLayout>
      <SavedContent />
    </DashboardLayout>
  );
}
