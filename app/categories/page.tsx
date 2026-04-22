import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, CircuitBoard, MemoryStick, MonitorPlay, HardDrive, Zap, Box, Fan } from "lucide-react";
import Link from "next/link";

const categories = [
  { id: "processors", name: "Processors", icon: Cpu, count: 128, color: "text-blue-500" },
  { id: "motherboards", name: "Motherboards", icon: CircuitBoard, count: 248, color: "text-green-500" },
  { id: "ram", name: "Memory", icon: MemoryStick, count: 312, color: "text-purple-500" },
  { id: "gpus", name: "Graphics Cards", icon: MonitorPlay, count: 198, color: "text-red-500" },
  { id: "storage", name: "Storage", icon: HardDrive, count: 318, color: "text-orange-500" },
  { id: "psu", name: "Power Supplies", icon: Zap, count: 145, color: "text-yellow-500" },
  { id: "cases", name: "Cases", icon: Box, count: 96, color: "text-cyan-500" },
  { id: "cooling", name: "Cooling", icon: Fan, count: 117, color: "text-pink-500" },
];

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Browse components by category</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/parts/${category.id}`}>
              <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.count} products available
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
