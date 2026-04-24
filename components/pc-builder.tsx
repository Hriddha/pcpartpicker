'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PartSelector } from './part-selector';
import { BuildSummary } from './build-summary';
import { AnimatedPC } from './animated-pc';
import { SaveBuildDialog } from './save-build-dialog';
import { Badge } from '@/components/ui/badge';
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

const API_URL = 'https://pcpartpicker-production.up.railway.app/builds.php';

export function PCBuilder() {
  const searchParams = useSearchParams();
  const loadId = searchParams.get('load');

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
  const [loadedBuildId, setLoadedBuildId] = useState<number | null>(null);
  const [loadedBuildName, setLoadedBuildName] = useState<string>('');
  const [isLoadingBuild, setIsLoadingBuild] = useState(false);

  // Load build from API when ?load= param is present
  useEffect(() => {
    if (!loadId) return;

    const fetchBuild = async () => {
      setIsLoadingBuild(true);
      try {
        const res = await fetch(`${API_URL}?id=${loadId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load build');

        setLoadedBuildId(data.build_id);
        setLoadedBuildName(data.build_name);

        // Match IDs from the API response to the mock data objects
        setSelectedParts({
          processor: mockProcessors.find((p) => p.processor_id === data.processor_id) ?? null,
          motherboard: mockMotherboards.find((m) => m.motherboard_id === data.motherboard_id) ?? null,
          ram: mockRAM.find((r) => r.ram_id === data.ram_id) ?? null,
          gpu: mockGPUs.find((g) => g.gpu_id === data.gpu_id) ?? null,
          storage: mockStorage.find((s) => s.storage_id === data.storage_id) ?? null,
          psu: mockPowerSupplies.find((p) => p.psu_id === data.psu_id) ?? null,
        });

        toast.success(`Loaded build: ${data.build_name}`);
      } catch (err) {
        console.error(err);
        toast.error('Could not load build');
      } finally {
        setIsLoadingBuild(false);
      }
    };

    fetchBuild();
  }, [loadId]);

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
    setLoadedBuildId(null);
    setLoadedBuildName('');
    toast.success('Build cleared');
  }, []);

  const handleSaveBuild = async (buildName: string) => {
    const buildData = {
      build_name: buildName,
      processor_id: selectedParts.processor?.processor_id ?? null,
      motherboard_id: selectedParts.motherboard?.motherboard_id ?? null,
      ram_id: selectedParts.ram?.ram_id ?? null,
      gpu_id: selectedParts.gpu?.gpu_id ?? null,
      storage_id: selectedParts.storage?.storage_id ?? null,
      psu_id: selectedParts.psu?.psu_id ?? null,
    };

    try {
      // If we have a loaded build ID, UPDATE it instead of creating a new one
      const isUpdate = loadedBuildId !== null;
      const url = isUpdate ? `${API_URL}?id=${loadedBuildId}` : API_URL;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Save failed:', data);
        toast.error(data.error ?? 'Failed to save build');
        return;
      }

      // On new build, store the returned ID for future saves in this session
      if (!isUpdate && data.id) {
        setLoadedBuildId(data.id);
        setLoadedBuildName(buildName);
      }

      toast.success(
        isUpdate
          ? `Build "${buildName}" updated successfully!`
          : `Build "${buildName}" saved successfully!`
      );
    } catch (err) {
      console.error('Network error:', err);
      toast.error('Network error — could not save build');
    }
  };

  // Get compatible motherboards based on selected CPU
  const compatibleMotherboards = selectedParts.processor
    ? mockMotherboards.filter((mb) => mb.socket_type === selectedParts.processor?.socket_type)
    : mockMotherboards;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PC Builder</h1>
          <p className="text-muted-foreground">
            {loadedBuildName ? `Editing: ${loadedBuildName}` : 'Select components to build your perfect PC'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {Object.values(selectedParts).filter(Boolean).length}/6 Parts Selected
        </Badge>
      </div>

      {isLoadingBuild ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-muted-foreground">Loading build...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Left Column - Part Selectors */}
          <div className="space-y-4">
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
            <div className="flex justify-center">
              <AnimatedPC selectedParts={selectedParts} />
            </div>
            <BuildSummary
              selectedParts={selectedParts}
              compatibilityResult={compatibilityResult}
              onClearAll={clearAllParts}
              onSaveBuild={() => setIsSaveDialogOpen(true)}
            />
          </div>
        </div>
      )}

      <SaveBuildDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveBuild}
        initialName={loadedBuildName}
        isUpdate={loadedBuildId !== null}
      />
    </div>
  );
}