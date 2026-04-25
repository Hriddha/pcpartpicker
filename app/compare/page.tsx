"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, Plus, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  processorsAPI,
  gpusAPI,
  ramAPI,
  motherboardsAPI,
  storageAPI,
  powerSuppliesAPI,
} from "@/lib/api";
import type { Processor, GPU, RAM, Motherboard, Storage, PowerSupply } from "@/lib/types";

type AnyPart = Processor | GPU | RAM | Motherboard | Storage | PowerSupply;

type CategoryKey = "processors" | "gpus" | "ram" | "motherboards" | "storage" | "psu";

const categoryConfig: Record<
  CategoryKey,
  {
    label: string;
    fetch: () => Promise<AnyPart[]>;
    getId: (p: AnyPart) => number;
    getSpecs: (p: AnyPart) => { label: string; value: string }[];
  }
> = {
  processors: {
    label: "Processors",
    fetch: () => processorsAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as Processor).processor_id,
    getSpecs: (p) => {
      const proc = p as Processor;
      return [
        { label: "Socket",      value: proc.socket_type },
        { label: "Cores",       value: `${proc.cores}` },
        { label: "Threads",     value: `${proc.threads}` },
        { label: "Base Clock",  value: `${proc.base_clock} GHz` },
        { label: "Boost Clock", value: `${proc.boost_clock} GHz` },
        { label: "TDP",         value: `${proc.tdp}W` },
      ];
    },
  },
  gpus: {
    label: "Graphics Cards",
    fetch: () => gpusAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as GPU).gpu_id,
    getSpecs: (p) => {
      const g = p as GPU;
      return [
        { label: "VRAM", value: `${g.vram}GB` },
        { label: "TDP",  value: `${g.tdp}W` },
      ];
    },
  },
  ram: {
    label: "Memory (RAM)",
    fetch: () => ramAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as RAM).ram_id,
    getSpecs: (p) => {
      const r = p as RAM;
      return [
        { label: "Type",     value: r.type },
        { label: "Capacity", value: r.capacity },
        { label: "Speed",    value: r.speed },
      ];
    },
  },
  motherboards: {
    label: "Motherboards",
    fetch: () => motherboardsAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as Motherboard).motherboard_id,
    getSpecs: (p) => {
      const m = p as Motherboard;
      return [
        { label: "Socket",      value: m.socket_type },
        { label: "Chipset",     value: m.chipset },
        { label: "Form Factor", value: m.form_factor },
        { label: "RAM Slots",   value: `${m.ram_slots}` },
        { label: "Max RAM",     value: m.max_ram },
      ];
    },
  },
  storage: {
    label: "Storage",
    fetch: () => storageAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as Storage).storage_id,
    getSpecs: (p) => {
      const s = p as Storage;
      return [
        { label: "Type",      value: s.type },
        { label: "Capacity",  value: s.capacity },
        { label: "Interface", value: s.interface },
      ];
    },
  },
  psu: {
    label: "Power Supplies",
    fetch: () => powerSuppliesAPI.getAll() as Promise<AnyPart[]>,
    getId: (p) => (p as PowerSupply).psu_id,
    getSpecs: (p) => {
      const ps = p as PowerSupply;
      return [
        { label: "Wattage",    value: `${ps.wattage}W` },
        { label: "Efficiency", value: ps.efficiency_rating },
      ];
    },
  },
};

export default function ComparePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("processors");
  const [parts, setParts] = useState<AnyPart[]>([]);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch parts whenever category changes
  useEffect(() => {
    setIsLoading(true);
    setCompareIds([]);
    categoryConfig[selectedCategory]
      .fetch()
      .then(setParts)
      .catch(() => setParts([]))
      .finally(() => setIsLoading(false));
  }, [selectedCategory]);

  const config = categoryConfig[selectedCategory];
  const selectedParts = parts.filter((p) => compareIds.includes(config.getId(p)));

  const toggleCompare = (id: number) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  // Get all unique spec labels across selected parts
  const specLabels = selectedParts.length > 0
    ? config.getSpecs(selectedParts[0]).map((s) => s.label)
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compare Products</h1>
          <p className="text-muted-foreground">Compare specifications side by side</p>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-4">
          <Select
            value={selectedCategory}
            onValueChange={(v) => setSelectedCategory(v as CategoryKey)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(categoryConfig) as CategoryKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {categoryConfig[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {compareIds.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {compareIds.length}/3 selected
            </span>
          )}
        </div>

        {/* Part selection buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select up to 3 products to compare</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : parts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No parts found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {parts.map((part) => {
                  const id = config.getId(part);
                  const name = (part as { name: string }).name;
                  const isSelected = compareIds.includes(id);
                  const isDisabled = !isSelected && compareIds.length >= 3;

                  return (
                    <Button
                      key={id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => toggleCompare(id)}
                      className="gap-2"
                    >
                      {isSelected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {name}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison table */}
        {selectedParts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th key="spec-header" className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Specification
                  </th>
                  {selectedParts.map((part) => (
                    <th
                      key={`header-${config.getId(part)}`}
                      className="p-3 text-left text-sm font-semibold"
                    >
                      {(part as { name: string }).name}
                    </th>
                  ))}
                </tr>
              </thead>
                  <tbody>
                    {specLabels.map((label) => (
                      <tr key={`row-${label}`} className="border-b border-border last:border-0">
                        <td className="p-3 text-sm text-muted-foreground">{label}</td>
                        {selectedParts.map((part) => (
                          <td key={`${label}-${config.getId(part)}`} className="p-3 text-sm">
                            {config.getSpecs(part).find((s) => s.label === label)?.value ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ArrowLeftRight className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No products selected</h3>
              <p className="text-muted-foreground">
                Select up to 3 products above to compare their specifications
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}