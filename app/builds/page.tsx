"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Wrench, Calendar, Cpu, MonitorPlay, MemoryStick, Zap, MoreVertical, Trash2, Edit, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const API_URL = "https://pcpartpicker-production.up.railway.app/builds.php";

interface Build {
  build_id: number;
  build_name: string;
  created_at: string;
  processor_name: string | null;
  gpu_name: string | null;
  ram_name: string | null;
  storage_name: string | null;
  psu_name: string | null;
}

function BuildsContent() {
  const { isAuthenticated } = useAuth();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    fetchBuilds();
  }, [isAuthenticated]);

  const fetchBuilds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch builds");
      setBuilds(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load builds");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete build");
      setBuilds((prev) => prev.filter((b) => b.build_id !== id));
      toast.success("Build deleted");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete build");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Wrench className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Sign in to view your builds</h2>
        <p className="mb-6 text-muted-foreground">
          Create an account to save and manage your PC builds
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Confirm Delete Dialog */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this build?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The build will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
            >
              {deletingId === confirmDeleteId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Builds</h1>
          <p className="text-muted-foreground">Manage your saved PC configurations</p>
        </div>
        <Link href="/builder">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Build
          </Button>
        </Link>
      </div>

      {/* Builds Grid */}
      {builds.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No builds yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start building your first PC configuration
            </p>
            <Link href="/builder">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Build
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <Card
              key={build.build_id}
              className="group border-border bg-card transition-all hover:border-primary/50"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{build.build_name}</CardTitle>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(build.created_at).toLocaleDateString()}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/builder?load=${build.build_id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setConfirmDeleteId(build.build_id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {build.processor_name && (
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-muted-foreground">{build.processor_name}</span>
                    </div>
                  )}
                  {build.gpu_name && (
                    <div className="flex items-center gap-2">
                      <MonitorPlay className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-muted-foreground">{build.gpu_name}</span>
                    </div>
                  )}
                  {build.ram_name && (
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-muted-foreground">{build.ram_name}</span>
                    </div>
                  )}
                  {!build.processor_name && !build.gpu_name && !build.ram_name && (
                    <p className="text-xs text-muted-foreground">No components selected</p>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground text-xs">
                      {build.psu_name ?? "No PSU"}
                    </span>
                  </div>
                  <Link href={`/builder?load=${build.build_id}`}>
                    <Button variant="outline" size="sm">
                      View Build
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuildsPage() {
  return (
    <DashboardLayout>
      <BuildsContent />
    </DashboardLayout>
  );
}