"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Wrench, Calendar, Cpu, MemoryStick, HardDrive, Zap, MoreVertical, Trash2, Edit } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

// Mock saved builds for demo
const mockBuilds = [
  {
    id: 1,
    name: "Gaming Beast",
    created_at: "2026-04-15",
    parts: {
      processor: "AMD Ryzen 9 7950X",
      gpu: "NVIDIA RTX 4090",
      ram: "64GB DDR5",
      storage: "2TB NVMe SSD",
    },
    total_wattage: 850,
  },
  {
    id: 2,
    name: "Workstation Pro",
    created_at: "2026-04-10",
    parts: {
      processor: "Intel Core i9-14900K",
      gpu: "NVIDIA RTX 4080",
      ram: "128GB DDR5",
      storage: "4TB NVMe SSD",
    },
    total_wattage: 750,
  },
  {
    id: 3,
    name: "Budget Build",
    created_at: "2026-04-05",
    parts: {
      processor: "AMD Ryzen 5 7600",
      gpu: "NVIDIA RTX 4060",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
    },
    total_wattage: 450,
  },
];

function BuildsContent() {
  const { isAuthenticated } = useAuth();
  const [builds] = useState(mockBuilds);

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

  return (
    <div className="space-y-6">
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
            <Card key={build.id} className="group border-border bg-card transition-all hover:border-primary/50">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{build.name}</CardTitle>
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
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{build.parts.processor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{build.parts.gpu}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{build.parts.ram}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">{build.total_wattage}W</span>
                  </div>
                  <Link href={`/builder?load=${build.id}`}>
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
