'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  MonitorPlay,
  HardDrive,
  Zap,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { SelectedParts, CompatibilityResult } from '@/lib/types';

interface BuildSummaryProps {
  selectedParts: SelectedParts;
  compatibilityResult: CompatibilityResult | null;
  onClearAll: () => void;
  onSaveBuild: () => void;
  isLoading?: boolean;
}

const partConfig = [
  { key: 'processor' as const, label: 'CPU', icon: Cpu },
  { key: 'motherboard' as const, label: 'Motherboard', icon: CircuitBoard },
  { key: 'ram' as const, label: 'RAM', icon: MemoryStick },
  { key: 'gpu' as const, label: 'GPU', icon: MonitorPlay },
  { key: 'storage' as const, label: 'Storage', icon: HardDrive },
  { key: 'psu' as const, label: 'PSU', icon: Zap },
];

export function BuildSummary({
  selectedParts,
  compatibilityResult,
  onClearAll,
  onSaveBuild,
  isLoading,
}: BuildSummaryProps) {
  const selectedCount = Object.values(selectedParts).filter(Boolean).length;
  const totalParts = partConfig.length;
  const completionPercentage = (selectedCount / totalParts) * 100;

  const getPartName = (key: keyof SelectedParts): string => {
    const part = selectedParts[key];
    if (!part) return 'Not selected';
    return 'name' in part ? (part.name as string) : 'Selected';
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Build Summary</CardTitle>
          <Badge variant={selectedCount === totalParts ? 'default' : 'secondary'}>
            {selectedCount}/{totalParts} Parts
          </Badge>
        </div>
        <Progress value={completionPercentage} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Parts List */}
        <div className="space-y-2">
          {partConfig.map(({ key, label, icon: Icon }) => {
            const isSelected = selectedParts[key] !== null;
            return (
              <div
                key={key}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-colors',
                  isSelected ? 'bg-secondary/50' : 'bg-transparent'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-md',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={cn('text-sm truncate', isSelected ? 'font-medium' : 'text-muted-foreground')}>
                    {getPartName(key)}
                  </p>
                </div>
                {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Compatibility Status */}
        {compatibilityResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {compatibilityResult.compatible ? (
                <>
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">All components compatible</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-sm">Compatibility issues found</span>
                </>
              )}
            </div>

            {/* Issues */}
            {compatibilityResult.issues.length > 0 && (
              <div className="space-y-2">
                {compatibilityResult.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">{issue.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {compatibilityResult.warnings.length > 0 && (
              <div className="space-y-2">
                {compatibilityResult.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20"
                  >
                    <AlertTriangle className="h-4 w-4 text-[oklch(0.75_0.18_80)] shrink-0 mt-0.5" />
                    <p className="text-xs text-[oklch(0.75_0.18_80)]">{warning.message}</p>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Power Analysis */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Power Analysis</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground">CPU TDP</p>
                  <p className="font-medium">{compatibilityResult.power_analysis.cpu_tdp}W</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground">GPU TDP</p>
                  <p className="font-medium">{compatibilityResult.power_analysis.gpu_tdp}W</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground">Total Est.</p>
                  <p className="font-medium">{compatibilityResult.power_analysis.total_estimated}W</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground">Recommended PSU</p>
                  <p className="font-medium">{compatibilityResult.power_analysis.recommended_psu}W</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Performance Score */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Performance</h4>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    compatibilityResult.performance.tier === 'Enthusiast' && 'border-primary text-primary',
                    compatibilityResult.performance.tier === 'High End' && 'border-accent text-accent',
                    compatibilityResult.performance.tier === 'Mid Range' && 'border-[oklch(0.75_0.18_80)] text-[oklch(0.75_0.18_80)]'
                  )}
                >
                  {compatibilityResult.performance.tier}
                </Badge>
                <span className="text-2xl font-bold text-primary">
                  {compatibilityResult.performance.score}
                </span>
              </div>
              <Progress
                value={Math.min((compatibilityResult.performance.score / 1500) * 100, 100)}
                className="h-2"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={selectedCount === 0}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            size="sm"
            onClick={onSaveBuild}
            disabled={selectedCount === 0 || isLoading}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Build
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
