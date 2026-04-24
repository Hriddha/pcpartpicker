'use client';

import { useState, useEffect, useCallback } from 'react';
import { PartSelector } from './part-selector';
import { BuildSummary } from './build-summary';
import { AnimatedPC } from './animated-pc';
import { SaveBuildDialog } from './save-build-dialog';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  mockProcessors,
  mockMotherboards,
  mockRAM,
  mockGPUs,
  mockStorage,
  mockPowerSupplies,
  checkLocalCompatibility,
} from '@/lib/mock-data';
import type {
  Processor,
  Motherboard,
  RAM,
  GPU,
  Storage,
  PowerSupply,
  SelectedParts,
  CompatibilityResult,
} from '@/lib/types';

export function PCBuilder() {
  const [selectedParts, setSelectedParts] = useState<SelectedParts>({
    processor: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    psu: null,
  });

  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Check compatibility whenever parts change
  useEffect(() => {
    const hasAnyPart = Object.values(selectedParts).some(Boolean);
    if (hasAnyPart) {
      const result = checkLocalCompatibility({
        processor: selectedParts.processor,
        motherboard: selectedParts.motherboard,
        ram: selectedParts.ram,
        gpu: selectedParts.gpu,
        psu: selectedParts.psu,
      });
      setCompatibilityResult(result);
    } else {
      setCompatibilityResult(null);
    }
  }, [selectedParts]);

  // Handlers
  const setProcessor = useCallback((processor: Processor | null) => {
    setSelectedParts((prev) => ({ ...prev, processor }));
  }, []);

  const setMotherboard = useCallback((motherboard: Motherboard | null) => {
    setSelectedParts((prev) => ({ ...prev, motherboard }));
  }, []);

  const setRam = useCallback((ram: RAM | null) => {
    setSelectedParts((prev) => ({ ...prev, ram }));
  }, []);

  const setGpu = useCallback((gpu: GPU | null) => {
    setSelectedParts((prev) => ({ ...prev, gpu }));
  }, []);

  const setStorage = useCallback((storage: Storage | null) => {
    setSelectedParts((prev) => ({ ...prev, storage }));
  }, []);

  const setPsu = useCallback((psu: PowerSupply | null) => {
    setSelectedParts((prev) => ({ ...prev, psu }));
  }, []);

  const clearAllParts = useCallback(() => {
    setSelectedParts({
      processor: null,
      motherboard: null,
      ram: null,
      gpu: null,
      storage: null,
      psu: null,
    });
    toast.success('Build cleared');
  }, []);

  const handleSaveBuild = async (buildName: string) => {
    // In a real app, this would call the PHP API
    // For now, we simulate saving locally
    const buildData = {
      build_name: buildName,
      processor_id: selectedParts.processor?.processor_id,
      motherboard_id: selectedParts.motherboard?.motherboard_id,
      ram_id: selectedParts.ram?.ram_id,
      gpu_id: selectedParts.gpu?.gpu_id,
      storage_id: selectedParts.storage?.storage_id,
      psu_id: selectedParts.psu?.psu_id,
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Store in localStorage for demo
    // const existingBuilds = JSON.parse(localStorage.getItem('pcBuilds') || '[]');
    // existingBuilds.push({ ...buildData, id: Date.now(), created_at: new Date().toISOString() });
    // localStorage.setItem('pcBuilds', JSON.stringify(existingBuilds));
    const res = await fetch('https://pcpartpicker-production.up.railway.app/builds.php',{
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body:JSON.stringify({...buildData})
    })

    const data = await res.json
    console.log(data)
    

    toast.success(`Build "${buildName}" saved successfully!`);
  };

  // Get compatible motherboards based on selected CPU
  const compatibleMotherboards = selectedParts.processor
    ? mockMotherboards.filter((mb) => mb.socket_type === selectedParts.processor?.socket_type)
    : mockMotherboards;

  // Get socket mismatch warning
  const getSocketWarning = () => {
    if (selectedParts.processor && selectedParts.motherboard) {
      if (selectedParts.processor.socket_type !== selectedParts.motherboard.socket_type) {
        return 'Socket mismatch';
      }
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PC Builder</h1>
          <p className="text-muted-foreground">Select components to build your perfect PC</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {Object.values(selectedParts).filter(Boolean).length}/6 Parts Selected
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr,380px] gap-8">
        {/* Left Column - Part Selectors */}
        <div className="space-y-4">
          {/* CPU */}
          <PartSelector<Processor>
            category="processor"
            title="Processor (CPU)"
            items={mockProcessors}
            selectedItem={selectedParts.processor}
            onSelect={setProcessor}
            getItemId={(p) => p.processor_id}
            getItemName={(p) => p.name}
            getItemDetails={(p) => [
              { label: 'Socket', value: p.socket_type },
              { label: 'Cores', value: `${p.cores}C/${p.threads}T` },
              { label: 'Clock', value: `${p.base_clock}-${p.boost_clock}GHz` },
              { label: 'TDP', value: `${p.tdp}W` },
            ]}
          />

          {/* Motherboard */}
          <PartSelector<Motherboard>
            category="motherboard"
            title="Motherboard"
            items={compatibleMotherboards}
            selectedItem={selectedParts.motherboard}
            onSelect={setMotherboard}
            getItemId={(m) => m.motherboard_id}
            getItemName={(m) => m.name}
            getItemDetails={(m) => [
              { label: 'Socket', value: m.socket_type },
              { label: 'Chipset', value: m.chipset },
              { label: 'Form Factor', value: m.form_factor },
              { label: 'Max RAM', value: m.max_ram },
            ]}
            compatibilityWarning={getSocketWarning()}
          />

          {/* RAM */}
          <PartSelector<RAM>
            category="ram"
            title="Memory (RAM)"
            items={mockRAM}
            selectedItem={selectedParts.ram}
            onSelect={setRam}
            getItemId={(r) => r.ram_id}
            getItemName={(r) => r.name}
            getItemDetails={(r) => [
              { label: 'Type', value: r.type },
              { label: 'Capacity', value: r.capacity },
              { label: 'Speed', value: r.speed },
            ]}
          />

          {/* GPU */}
          <PartSelector<GPU>
            category="gpu"
            title="Graphics Card (GPU)"
            items={mockGPUs}
            selectedItem={selectedParts.gpu}
            onSelect={setGpu}
            getItemId={(g) => g.gpu_id}
            getItemName={(g) => g.name}
            getItemDetails={(g) => [
              { label: 'VRAM', value: `${g.vram}GB` },
              { label: 'TDP', value: `${g.tdp}W` },
            ]}
          />

          {/* Storage */}
          <PartSelector<Storage>
            category="storage"
            title="Storage"
            items={mockStorage}
            selectedItem={selectedParts.storage}
            onSelect={setStorage}
            getItemId={(s) => s.storage_id}
            getItemName={(s) => s.name}
            getItemDetails={(s) => [
              { label: 'Type', value: s.type },
              { label: 'Capacity', value: s.capacity },
              { label: 'Interface', value: s.interface },
            ]}
          />

          {/* PSU */}
          <PartSelector<PowerSupply>
            category="psu"
            title="Power Supply (PSU)"
            items={mockPowerSupplies}
            selectedItem={selectedParts.psu}
            onSelect={setPsu}
            getItemId={(p) => p.psu_id}
            getItemName={(p) => p.name}
            getItemDetails={(p) => [
              { label: 'Wattage', value: `${p.wattage}W` },
              { label: 'Efficiency', value: p.efficiency_rating },
            ]}
          />
        </div>

        {/* Right Column - Build Summary & Animation */}
        <div className="space-y-6">
          {/* Animated PC */}
          <div className="flex justify-center">
            <AnimatedPC selectedParts={selectedParts} />
          </div>

          {/* Build Summary */}
          <BuildSummary
            selectedParts={selectedParts}
            compatibilityResult={compatibilityResult}
            onClearAll={clearAllParts}
            onSaveBuild={() => setIsSaveDialogOpen(true)}
          />
        </div>
      </div>

      {/* Save Build Dialog */}
      <SaveBuildDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveBuild}
      />
    </div>
  );
}
