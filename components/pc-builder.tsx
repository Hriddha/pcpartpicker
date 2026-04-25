'use client';
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PartSelector } from './part-selector';
import { BuildSummary } from './build-summary';
import { AnimatedPC } from './animated-pc';
import { SaveBuildDialog } from './save-build-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  processorsAPI,
  motherboardsAPI,
  ramAPI,
  gpusAPI,
  storageAPI,
  powerSuppliesAPI,
  buildsAPI,
  compatibilityAPI,
} from '@/lib/api';
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
  const searchParams = useSearchParams();
  const loadId = searchParams.get('load');
  const preCategory = searchParams.get('category');
  const preId = searchParams.get('id');

  // Parts lists fetched from API
  const [processors, setProcessors] = useState<Processor[]>([]);
  const [motherboards, setMotherboards] = useState<Motherboard[]>([]);
  const [ramList, setRamList] = useState<RAM[]>([]);
  const [gpus, setGpus] = useState<GPU[]>([]);
  const [storageList, setStorageList] = useState<Storage[]>([]);
  const [psus, setPsus] = useState<PowerSupply[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(true);

  // Current build state
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

  // Fetch all parts from API on mount
  useEffect(() => {
    const fetchAllParts = async () => {
      setIsLoadingParts(true);
      try {
        const [procs, mbs, ram, gpuList, storage, psuList] = await Promise.all([
          processorsAPI.getAll(),
          motherboardsAPI.getAll(),
          ramAPI.getAll(),
          gpusAPI.getAll(),
          storageAPI.getAll(),
          powerSuppliesAPI.getAll(),
        ]);
        setProcessors(procs);
        setMotherboards(mbs);
        setRamList(ram);
        setGpus(gpuList);
        setStorageList(storage);
        setPsus(psuList);
      } catch (err) {
        console.error('Failed to load parts:', err);
        toast.error('Failed to load parts from server');
      } finally {
        setIsLoadingParts(false);
      }
    };

    fetchAllParts();
  }, []);


  // Preselect a part from ?category=&id= (coming from "Add to Builder")
useEffect(() => {
  if (isLoadingParts || !preCategory || !preId) return;
  const id = Number(preId);
  setSelectedParts((prev) => {
    switch (preCategory) {
      case 'processors':   return { ...prev, processor:   processors.find((p) => p.processor_id === id)    ?? prev.processor };
      case 'motherboards': return { ...prev, motherboard: motherboards.find((m) => m.motherboard_id === id) ?? prev.motherboard };
      case 'ram':          return { ...prev, ram:          ramList.find((r) => r.ram_id === id)              ?? prev.ram };
      case 'gpus':         return { ...prev, gpu:          gpus.find((g) => g.gpu_id === id)                ?? prev.gpu };
      case 'storage':      return { ...prev, storage:      storageList.find((s) => s.storage_id === id)     ?? prev.storage };
      case 'psu':          return { ...prev, psu:          psus.find((p) => p.psu_id === id)                ?? prev.psu };
      default:             return prev;
    }
  });
  toast.success('Part added to builder!');
}, [isLoadingParts, preCategory, preId, processors, motherboards, ramList, gpus, storageList, psus]);

  // Load build from API when ?load= param is present
  // Only runs after parts lists are loaded so IDs can be matched correctly
  useEffect(() => {
    if (!loadId || isLoadingParts) return;
    if (
      processors.length === 0 &&
      motherboards.length === 0 &&
      ramList.length === 0 &&
      gpus.length === 0 &&
      storageList.length === 0 &&
      psus.length === 0
    ) return;

    const fetchBuild = async () => {
      setIsLoadingBuild(true);
      try {
        const data = await buildsAPI.getById(Number(loadId));

        setLoadedBuildId(data.build_id!);
        setLoadedBuildName(data.build_name);

        // Match IDs from the DB response to the real API-fetched part objects
        setSelectedParts({
          processor: processors.find((p) => p.processor_id === data.processor_id) ?? null,
          motherboard: motherboards.find((m) => m.motherboard_id === data.motherboard_id) ?? null,
          ram: ramList.find((r) => r.ram_id === data.ram_id) ?? null,
          gpu: gpus.find((g) => g.gpu_id === data.gpu_id) ?? null,
          storage: storageList.find((s) => s.storage_id === data.storage_id) ?? null,
          psu: psus.find((p) => p.psu_id === data.psu_id) ?? null,
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
  }, [loadId, isLoadingParts, processors, motherboards, ramList, gpus, storageList, psus]);

  // Check compatibility via API whenever parts change
  useEffect(() => {
    const hasAnyPart = Object.values(selectedParts).some(Boolean);
    if (!hasAnyPart) {
      setCompatibilityResult(null);
      return;
    }

    const checkCompat = async () => {
      try {
        const result = await compatibilityAPI.check(selectedParts);
        setCompatibilityResult(result);
      } catch (err) {
        console.error('Compatibility check failed:', err);
      }
    };

    checkCompat();
  }, [selectedParts]);

  // Part setters
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
      const isUpdate = loadedBuildId !== null;

      if (isUpdate) {
        await buildsAPI.update(loadedBuildId, buildData);
        toast.success(`Build "${buildName}" updated successfully!`);
      } else {
        const result = await buildsAPI.create(buildData);
        setLoadedBuildId(result.id);
        setLoadedBuildName(buildName);
        toast.success(`Build "${buildName}" saved successfully!`);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Could not save build');
    }
  };

  // Only show motherboards compatible with selected CPU socket
  const compatibleMotherboards = selectedParts.processor
    ? motherboards.filter((mb) => mb.socket_type === selectedParts.processor?.socket_type)
    : motherboards;

  const getSocketWarning = () => {
    if (selectedParts.processor && selectedParts.motherboard) {
      if (selectedParts.processor.socket_type !== selectedParts.motherboard.socket_type) {
        return 'Socket mismatch';
      }
    }
    return undefined;
  };

  const isLoading = isLoadingParts || isLoadingBuild;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PC Builder</h1>
          <p className="text-muted-foreground">
            {loadedBuildName
              ? `Editing: ${loadedBuildName}`
              : 'Select components to build your perfect PC'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {Object.values(selectedParts).filter(Boolean).length}/6 Parts Selected
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-muted-foreground">
            {isLoadingParts ? 'Loading parts...' : 'Loading build...'}
          </span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Left Column - Part Selectors */}
          <div className="space-y-4">
            <PartSelector<Processor>
              category="processor"
              title="Processor (CPU)"
              items={processors}
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
              items={ramList}
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
              items={gpus}
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
              items={storageList}
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
              items={psus}
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