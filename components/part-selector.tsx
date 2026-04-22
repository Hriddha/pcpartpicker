'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  MonitorPlay,
  HardDrive,
  Zap,
  X,
  Search,
  Check,
} from 'lucide-react';
import type { PartCategory } from '@/lib/types';

interface PartSelectorProps<T> {
  category: PartCategory;
  title: string;
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T | null) => void;
  getItemId: (item: T) => number;
  getItemName: (item: T) => string;
  getItemDetails: (item: T) => { label: string; value: string }[];
  filterKey?: string;
  filterValue?: string;
  compatibilityWarning?: string;
}

const categoryIcons: Record<PartCategory, React.ReactNode> = {
  processor: <Cpu className="h-5 w-5" />,
  motherboard: <CircuitBoard className="h-5 w-5" />,
  ram: <MemoryStick className="h-5 w-5" />,
  gpu: <MonitorPlay className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  psu: <Zap className="h-5 w-5" />,
};

export function PartSelector<T>({
  category,
  title,
  items,
  selectedItem,
  onSelect,
  getItemId,
  getItemName,
  getItemDetails,
  compatibilityWarning,
}: PartSelectorProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => getItemName(item).toLowerCase().includes(query));
  }, [items, searchQuery, getItemName]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsExpanded(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
  };

  return (
    <Card
      className={cn(
        'transition-all duration-300 overflow-hidden',
        isExpanded ? 'ring-2 ring-primary' : '',
        compatibilityWarning ? 'ring-2 ring-destructive' : ''
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-lg transition-colors',
                selectedItem ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              )}
            >
              {categoryIcons[category]}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {selectedItem && (
                <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-[200px]">
                  {getItemName(selectedItem)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedItem && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant={selectedItem ? 'outline' : 'default'}
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="min-w-[80px]"
            >
              {selectedItem ? 'Change' : 'Select'}
            </Button>
          </div>
        </div>
        {compatibilityWarning && (
          <Badge variant="destructive" className="mt-2 w-fit">
            {compatibilityWarning}
          </Badge>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items found</p>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItem && getItemId(item) === getItemId(selectedItem);
                  const details = getItemDetails(item);

                  return (
                    <button
                      key={getItemId(item)}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all duration-200',
                        'hover:border-primary/50 hover:bg-secondary/50',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{getItemName(item)}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {details.slice(0, 4).map((detail, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {detail.label}: {detail.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="shrink-0 p-1 bg-primary rounded-full">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
