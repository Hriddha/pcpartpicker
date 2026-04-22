'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  Processor,
  Motherboard,
  RAM,
  GPU,
  Storage,
  PowerSupply,
  SelectedParts,
  PartCategory,
} from './types';

interface BuildContextType {
  selectedParts: SelectedParts;
  setProcessor: (processor: Processor | null) => void;
  setMotherboard: (motherboard: Motherboard | null) => void;
  setRam: (ram: RAM | null) => void;
  setGpu: (gpu: GPU | null) => void;
  setStorage: (storage: Storage | null) => void;
  setPsu: (psu: PowerSupply | null) => void;
  clearPart: (category: PartCategory) => void;
  clearAllParts: () => void;
  getSelectedCount: () => number;
}

const initialParts: SelectedParts = {
  processor: null,
  motherboard: null,
  ram: null,
  gpu: null,
  storage: null,
  psu: null,
};

const BuildContext = createContext<BuildContextType | undefined>(undefined);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [selectedParts, setSelectedParts] = useState<SelectedParts>(initialParts);

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

  const clearPart = useCallback((category: PartCategory) => {
    setSelectedParts((prev) => ({ ...prev, [category]: null }));
  }, []);

  const clearAllParts = useCallback(() => {
    setSelectedParts(initialParts);
  }, []);

  const getSelectedCount = useCallback(() => {
    return Object.values(selectedParts).filter((part) => part !== null).length;
  }, [selectedParts]);

  return (
    <BuildContext.Provider
      value={{
        selectedParts,
        setProcessor,
        setMotherboard,
        setRam,
        setGpu,
        setStorage,
        setPsu,
        clearPart,
        clearAllParts,
        getSelectedCount,
      }}
    >
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild() {
  const context = useContext(BuildContext);
  if (context === undefined) {
    throw new Error('useBuild must be used within a BuildProvider');
  }
  return context;
}
