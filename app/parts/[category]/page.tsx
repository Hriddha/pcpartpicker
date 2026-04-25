"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  processorsAPI,
  motherboardsAPI,
  ramAPI,
  gpusAPI,
  storageAPI,
  powerSuppliesAPI,
} from "@/lib/api";
import type {
  Processor,
  Motherboard,
  RAM,
  GPU,
  Storage,
  PowerSupply,
} from "@/lib/types";

type AnyPart = Processor | Motherboard | RAM | GPU | Storage | PowerSupply;

const categoryConfig: Record<
  string,
  {
    name: string;
    description: string;
    fetch: () => Promise<AnyPart[]>;
    getDetails: (part: AnyPart) => { label: string; value: string }[];
    getId: (part: AnyPart) => number;
  }
> = {
  processors: {
    name: "Processors (CPU)",
    description: "Intel Core, AMD Ryzen",
    fetch: () => processorsAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as Processor).processor_id,
    getDetails: (p) => {
      const proc = p as Processor;
      return [
        { label: "Socket", value: proc.socket_type },
        { label: "Cores", value: `${proc.cores}C / ${proc.threads}T` },
        { label: "Base Clock", value: `${proc.base_clock} GHz` },
        { label: "Boost Clock", value: `${proc.boost_clock} GHz` },
        { label: "TDP", value: `${proc.tdp}W` },
      ];
    },
  },
  motherboards: {
    name: "Motherboards",
    description: "ATX, Micro ATX, Mini ITX",
    fetch: () => motherboardsAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as Motherboard).motherboard_id,
    getDetails: (p) => {
      const mb = p as Motherboard;
      return [
        { label: "Socket", value: mb.socket_type },
        { label: "Chipset", value: mb.chipset },
        { label: "Form Factor", value: mb.form_factor },
        { label: "RAM Slots", value: `${mb.ram_slots}` },
        { label: "Max RAM", value: mb.max_ram },
      ];
    },
  },
  ram: {
    name: "Memory (RAM)",
    description: "DDR4, DDR5",
    fetch: () => ramAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as RAM).ram_id,
    getDetails: (p) => {
      const r = p as RAM;
      return [
        { label: "Type", value: r.type },
        { label: "Capacity", value: r.capacity },
        { label: "Speed", value: r.speed },
      ];
    },
  },
  gpus: {
    name: "Graphics Cards (GPU)",
    description: "NVIDIA GeForce, AMD Radeon",
    fetch: () => gpusAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as GPU).gpu_id,
    getDetails: (p) => {
      const g = p as GPU;
      return [
        { label: "VRAM", value: `${g.vram}GB` },
        { label: "TDP", value: `${g.tdp}W` },
      ];
    },
  },
  storage: {
    name: "Storage",
    description: "SSD, HDD, NVMe",
    fetch: () => storageAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as Storage).storage_id,
    getDetails: (p) => {
      const s = p as Storage;
      return [
        { label: "Type", value: s.type },
        { label: "Capacity", value: s.capacity },
        { label: "Interface", value: s.interface },
      ];
    },
  },
  psu: {
    name: "Power Supplies (PSU)",
    description: "Modular, Semi-Modular",
    fetch: () => powerSuppliesAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as PowerSupply).psu_id,
    getDetails: (p) => {
      const ps = p as PowerSupply;
      return [
        { label: "Wattage", value: `${ps.wattage}W` },
        { label: "Efficiency", value: ps.efficiency_rating },
      ];
    },
  },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  const config = categoryConfig[category];

  const [parts, setParts] = useState<AnyPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;

    const fetchParts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await config.fetch();
        setParts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load parts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  }, [category]);

  if (!config) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-muted-foreground">Category not found.</p>
          <Button onClick={() => router.push("/parts")}>Back to Parts</Button>
        </div>
      </DashboardLayout>
    );
  }

  const filteredParts = parts.filter((part) =>
    (part as { name: string }).name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/parts")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{config.name}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Search + Count */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${config.name.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              {filteredParts.length} {filteredParts.length === 1 ? "part" : "parts"} found
            </span>
          )}
        </div>

        {/* Parts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="text-muted-foreground">Loading parts...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.refresh()}>Retry</Button>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-muted-foreground">No parts found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredParts.map((part) => {
              const details = config.getDetails(part);
              const id = config.getId(part);
              const name = (part as { name: string }).name;

              return (
                <Card
                  key={id}
                  className="border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Part name */}
                    <div>
                      <h3 className="font-semibold text-foreground leading-snug">
                        {name}
                      </h3>
                    </div>

                    {/* Spec badges */}
                    <div className="flex flex-wrap gap-2">
                      {details.map((d) => (
                        <Badge
                          key={d.label}
                          variant="secondary"
                          className="text-xs"
                        >
                          {d.label}: {d.value}
                        </Badge>
                      ))}
                    </div>

                    {/* Add to builder button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        router.push(`/builder?category=${category}&id=${id}`)
                      }
                    >
                      Add to Builder
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}