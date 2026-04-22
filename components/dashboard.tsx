"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  ChevronRight,
  Package,
  Wrench,
  Users,
  Tag,
  ShieldCheck,
  DollarSign,
  Share2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

const componentCategories = [
  {
    id: "cpu",
    name: "CPU",
    subtitle: "Intel, AMD",
    count: 128,
    image: "/images/cpu.jpg",
    href: "/parts/processors",
  },
  {
    id: "motherboard",
    name: "Motherboards",
    subtitle: "ATX, Micro ATX, ITX",
    count: 248,
    image: "/images/motherboard.jpg",
    href: "/parts/motherboards",
  },
  {
    id: "ram",
    name: "RAM",
    subtitle: "DDR4, DDR5",
    count: 312,
    image: "/images/ram.jpg",
    href: "/parts/ram",
  },
  {
    id: "gpu",
    name: "GPUs",
    subtitle: "NVIDIA, AMD",
    count: 198,
    image: "/images/gpu.jpg",
    href: "/parts/gpus",
  },
  {
    id: "storage",
    name: "Storage",
    subtitle: "SSD, HDD, NVMe",
    count: 318,
    image: "/images/storage.jpg",
    href: "/parts/storage",
  },
  {
    id: "psu",
    name: "PSUs",
    subtitle: "500W - 1200W",
    count: 145,
    image: "/images/psu.jpg",
    href: "/parts/psu",
  },
  {
    id: "case",
    name: "Cases",
    subtitle: "ATX, Mid Tower, ITX",
    count: 96,
    image: "/images/case.jpg",
    href: "/parts/cases",
  },
  {
    id: "cooling",
    name: "Cooling",
    subtitle: "Air, AIO, Custom",
    count: 117,
    image: "/images/cooling.jpg",
    href: "/parts/cooling",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Compatibility Check",
    description: "Avoid conflicts & build smarter",
  },
  {
    icon: DollarSign,
    title: "Price Comparison",
    description: "Find the best deals",
  },
  {
    icon: Share2,
    title: "Save & Share Builds",
    description: "Collaborate with others",
  },
  {
    icon: Clock,
    title: "Real-time Prices",
    description: "Always up to date",
  },
];

export function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    parts: 2542,
    builds: 1243,
    users: 8431,
    deals: 523,
  });

  // Simulate fetching stats
  useEffect(() => {
    // In production, fetch from /api/php/stats.php
    setStats({
      parts: 2542,
      builds: 1243,
      users: 8431,
      deals: 523,
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              BUILD WITHOUT LIMITS
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl xl:text-6xl">
                Pick the Best.
              </h1>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl">
                <span className="text-primary">Build</span>{" "}
                <span className="text-foreground">Your Dream.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="max-w-md text-lg text-muted-foreground">
              Compare prices, check compatibility, and build the perfect PC with ease.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/builder">
                <Button size="lg" className="gap-2">
                  Start New Build
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/builds">
                <Button variant="outline" size="lg" className="gap-2">
                  View My Builds
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <StatItem icon={Package} label="Parts" value={stats.parts.toLocaleString()} />
              <StatItem icon={Wrench} label="Builds" value={stats.builds.toLocaleString()} />
              <StatItem icon={Users} label="Users" value={stats.users.toLocaleString()} />
              <StatItem icon={Tag} label="Deals" value={stats.deals.toLocaleString()} />
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square w-full max-w-lg ml-auto">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
              <Image
                src="/images/hero-pc.jpg"
                alt="High-end gaming PC build"
                fill
                className="relative rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Browse Components Section */}
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Browse Components</h2>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
          {componentCategories.map((category) => (
            <Link key={category.id} href={category.href}>
              <Card className="group h-full overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.subtitle}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {category.count} Products
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="mt-8 rounded-xl border border-border bg-card/50 p-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
