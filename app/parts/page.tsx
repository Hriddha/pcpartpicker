"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  {
    id: "processors",
    name: "Processors (CPU)",
    description: "Intel Core, AMD Ryzen",
    count: 128,
    image: "/images/cpu.jpg",
  },
  {
    id: "motherboards",
    name: "Motherboards",
    description: "ATX, Micro ATX, Mini ITX",
    count: 248,
    image: "/images/motherboard.jpg",
  },
  {
    id: "ram",
    name: "Memory (RAM)",
    description: "DDR4, DDR5",
    count: 312,
    image: "/images/ram.jpg",
  },
  {
    id: "gpus",
    name: "Graphics Cards (GPU)",
    description: "NVIDIA GeForce, AMD Radeon",
    count: 198,
    image: "/images/gpu.jpg",
  },
  {
    id: "storage",
    name: "Storage",
    description: "SSD, HDD, NVMe",
    count: 318,
    image: "/images/storage.jpg",
  },
  {
    id: "psu",
    name: "Power Supplies (PSU)",
    description: "Modular, Semi-Modular",
    count: 145,
    image: "/images/psu.jpg",
  },
  {
    id: "cases",
    name: "Cases",
    description: "ATX, Mid Tower, Full Tower",
    count: 96,
    image: "/images/case.jpg",
  },
  {
    id: "cooling",
    name: "CPU Cooling",
    description: "Air Coolers, AIO Liquid",
    count: 117,
    image: "/images/cooling.jpg",
  },
];

export default function PartsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Parts</h1>
          <p className="text-muted-foreground">
            Explore our extensive catalog of PC components
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="count">Product Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/parts/${category.id}`}>
              <Card className="group h-full overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 pt-0">
                    <span className="text-sm text-muted-foreground">
                      {category.count} Products
                    </span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Browse
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
