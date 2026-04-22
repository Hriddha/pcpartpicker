"use client";

import { useState } from "react";
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

const mockProducts = {
  processors: [
    { id: 1, name: "AMD Ryzen 9 7950X", cores: 16, threads: 32, baseClock: "4.5 GHz", boostClock: "5.7 GHz", tdp: 170 },
    { id: 2, name: "Intel Core i9-14900K", cores: 24, threads: 32, baseClock: "3.2 GHz", boostClock: "6.0 GHz", tdp: 125 },
    { id: 3, name: "AMD Ryzen 7 7800X3D", cores: 8, threads: 16, baseClock: "4.2 GHz", boostClock: "5.0 GHz", tdp: 120 },
  ],
};

export default function ComparePage() {
  const [selectedCategory, setSelectedCategory] = useState("processors");
  const [compareItems, setCompareItems] = useState<number[]>([]);

  const products = mockProducts.processors;
  const selectedProducts = products.filter((p) => compareItems.includes(p.id));

  const addToCompare = (id: number) => {
    if (compareItems.length < 3 && !compareItems.includes(id)) {
      setCompareItems([...compareItems, id]);
    }
  };

  const removeFromCompare = (id: number) => {
    setCompareItems(compareItems.filter((i) => i !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compare Products</h1>
          <p className="text-muted-foreground">
            Compare specifications side by side
          </p>
        </div>

        {/* Category Selection */}
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="processors">Processors</SelectItem>
              <SelectItem value="gpus">Graphics Cards</SelectItem>
              <SelectItem value="ram">Memory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Products to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <Button
                  key={product.id}
                  variant={compareItems.includes(product.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    compareItems.includes(product.id)
                      ? removeFromCompare(product.id)
                      : addToCompare(product.id)
                  }
                  className="gap-2"
                >
                  {compareItems.includes(product.id) ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {product.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedProducts.length > 0 ? (
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
                      <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                        Specification
                      </th>
                      {selectedProducts.map((product) => (
                        <th
                          key={product.id}
                          className="p-3 text-left text-sm font-medium"
                        >
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-3 text-sm text-muted-foreground">Cores</td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-3 text-sm">
                          {product.cores}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 text-sm text-muted-foreground">Threads</td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-3 text-sm">
                          {product.threads}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 text-sm text-muted-foreground">Base Clock</td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-3 text-sm">
                          {product.baseClock}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 text-sm text-muted-foreground">Boost Clock</td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-3 text-sm">
                          {product.boostClock}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-sm text-muted-foreground">TDP</td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-3 text-sm">
                          {product.tdp}W
                        </td>
                      ))}
                    </tr>
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
                Select up to 3 products to compare their specifications
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
