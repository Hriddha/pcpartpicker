'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SelectedParts } from '@/lib/types';

interface AnimatedPCProps {
  selectedParts: SelectedParts;
  className?: string;
}

export function AnimatedPC({ selectedParts, className }: AnimatedPCProps) {
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Calculate glow based on number of selected parts
  useEffect(() => {
    const count = Object.values(selectedParts).filter(Boolean).length;
    setGlowIntensity(count / 6);
  }, [selectedParts]);

  const hasCpu = selectedParts.processor !== null;
  const hasMotherboard = selectedParts.motherboard !== null;
  const hasRam = selectedParts.ram !== null;
  const hasGpu = selectedParts.gpu !== null;
  const hasStorage = selectedParts.storage !== null;
  const hasPsu = selectedParts.psu !== null;

  return (
    <div className={cn('relative w-full max-w-[300px] aspect-[3/4]', className)}>
      {/* PC Case */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl border-2 transition-all duration-500',
          'bg-gradient-to-br from-secondary/80 to-secondary/40',
          glowIntensity > 0 ? 'border-primary/50' : 'border-border'
        )}
        style={{
          boxShadow:
            glowIntensity > 0
              ? `0 0 ${20 + glowIntensity * 40}px oklch(0.65 0.2 145 / ${glowIntensity * 0.3}), inset 0 0 ${10 + glowIntensity * 20}px oklch(0.65 0.2 145 / ${glowIntensity * 0.1})`
              : 'none',
        }}
      >
        {/* Glass Panel */}
        <div className="absolute left-3 top-3 right-3 bottom-16 rounded-lg border border-border/50 bg-background/30 backdrop-blur-sm overflow-hidden">
          {/* Internal Components */}
          <div className="relative w-full h-full p-3">
            {/* Motherboard Area */}
            <div
              className={cn(
                'absolute inset-3 rounded-md transition-all duration-500',
                hasMotherboard ? 'bg-secondary/60 border border-primary/30' : 'bg-secondary/20 border border-dashed border-muted-foreground/20'
              )}
            >
              {/* CPU Socket */}
              <div
                className={cn(
                  'absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-md transition-all duration-500',
                  hasCpu
                    ? 'bg-gradient-to-br from-primary to-primary/60 shadow-lg'
                    : 'bg-muted border border-dashed border-muted-foreground/30'
                )}
                style={{
                  boxShadow: hasCpu ? '0 0 20px oklch(0.65 0.2 145 / 0.5)' : 'none',
                }}
              >
                {hasCpu && (
                  <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-primary-foreground/40 rounded-sm"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RAM Slots */}
              <div className="absolute top-4 right-3 space-y-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-14 rounded-sm transition-all duration-500',
                      hasRam && i < 2
                        ? 'bg-gradient-to-b from-accent to-accent/60'
                        : 'bg-muted/50 border border-dashed border-muted-foreground/20'
                    )}
                    style={{
                      boxShadow: hasRam && i < 2 ? '0 0 10px oklch(0.55 0.18 200 / 0.5)' : 'none',
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>

              {/* GPU */}
              <div
                className={cn(
                  'absolute bottom-4 left-3 right-3 h-16 rounded-md transition-all duration-500',
                  hasGpu
                    ? 'bg-gradient-to-r from-secondary to-secondary/60 border border-primary/40'
                    : 'bg-muted/30 border border-dashed border-muted-foreground/20'
                )}
              >
                {hasGpu && (
                  <>
                    {/* GPU Fans */}
                    <div className="absolute inset-2 flex items-center justify-around">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-primary/50 flex items-center justify-center"
                          style={{
                            animation: 'spin 1s linear infinite',
                            animationDelay: `${i * 100}ms`,
                          }}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/30">
                            <div className="w-full h-full rounded-full border-t-2 border-primary/60" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* RGB Strip */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-md"
                      style={{
                        background: 'linear-gradient(90deg, oklch(0.65 0.2 145), oklch(0.55 0.18 200), oklch(0.6 0.2 300), oklch(0.65 0.2 145))',
                        backgroundSize: '200% 100%',
                        animation: 'rgbFlow 3s linear infinite',
                      }}
                    />
                  </>
                )}
              </div>

              {/* Storage Drive */}
              <div
                className={cn(
                  'absolute top-20 left-3 w-8 h-12 rounded transition-all duration-500',
                  hasStorage
                    ? 'bg-gradient-to-b from-muted to-muted/60 border border-primary/30'
                    : 'bg-muted/20 border border-dashed border-muted-foreground/20'
                )}
              >
                {hasStorage && (
                  <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PSU Area */}
        <div
          className={cn(
            'absolute bottom-3 left-3 right-3 h-10 rounded-md transition-all duration-500',
            hasPsu
              ? 'bg-gradient-to-r from-secondary to-secondary/60 border border-primary/30'
              : 'bg-muted/30 border border-dashed border-muted-foreground/20'
          )}
        >
          {hasPsu && (
            <>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 grid grid-cols-4 gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                ))}
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground font-mono">
                {selectedParts.psu?.wattage}W
              </div>
            </>
          )}
        </div>

        {/* Front Panel Ports */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="w-4 h-4 rounded-full bg-muted border border-muted-foreground/30" />
          <div className="w-4 h-1.5 rounded-sm bg-muted border border-muted-foreground/30" />
        </div>

        {/* Power Button */}
        <div
          className={cn(
            'absolute top-4 left-4 w-6 h-6 rounded-full border-2 transition-all duration-500',
            glowIntensity > 0
              ? 'border-primary bg-primary/20'
              : 'border-muted-foreground/30 bg-muted'
          )}
          style={{
            boxShadow: glowIntensity > 0 ? '0 0 10px oklch(0.65 0.2 145 / 0.5)' : 'none',
          }}
        >
          <div
            className={cn(
              'absolute inset-1 rounded-full transition-colors duration-500',
              glowIntensity > 0 ? 'bg-primary animate-pulse' : 'bg-transparent'
            )}
          />
        </div>

        {/* Case Fans */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-16 flex flex-col justify-around">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full border border-muted-foreground/20"
            />
          ))}
        </div>
      </div>

      {/* Custom Keyframes */}
      <style jsx>{`
        @keyframes rgbFlow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
