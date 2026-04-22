// PC Part Picker Type Definitions

export interface Processor {
  processor_id: number;
  name: string;
  socket_type: string;
  cores: number;
  threads: number;
  base_clock: number;
  boost_clock: number;
  tdp: number;
}

export interface Motherboard {
  motherboard_id: number;
  name: string;
  socket_type: string;
  chipset: string;
  form_factor: string;
  ram_slots: number;
  max_ram: string;
}

export interface RAM {
  ram_id: number;
  name: string;
  type: string;
  capacity: string;
  speed: string;
}

export interface GPU {
  gpu_id: number;
  name: string;
  vram: number;
  tdp: number;
}

export interface Storage {
  storage_id: number;
  name: string;
  type: string;
  capacity: string;
  interface: string;
}

export interface PowerSupply {
  psu_id: number;
  name: string;
  wattage: number;
  efficiency_rating: string;
}

export interface PCBuild {
  build_id?: number;
  user_id?: number;
  build_name: string;
  processor_id?: number;
  motherboard_id?: number;
  ram_id?: number;
  gpu_id?: number;
  storage_id?: number;
  psu_id?: number;
  created_at?: string;
}

export interface SelectedParts {
  processor: Processor | null;
  motherboard: Motherboard | null;
  ram: RAM | null;
  gpu: GPU | null;
  storage: Storage | null;
  psu: PowerSupply | null;
}

export interface CompatibilityIssue {
  type: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface PowerAnalysis {
  cpu_tdp: number;
  gpu_tdp: number;
  estimated_other: number;
  total_estimated: number;
  recommended_psu: number;
  psu_wattage: number | null;
}

export interface PerformanceAnalysis {
  score: number;
  tier: string;
  breakdown: {
    cpu?: number;
    gpu?: number;
    ram?: number;
  };
}

export interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  power_analysis: PowerAnalysis;
  performance: PerformanceAnalysis;
}

export type PartCategory = 'processor' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu';

// User & Authentication Types
export interface User {
  user_id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  roles?: string[];
  build_count?: number;
}

export interface AuthResponse {
  message?: string;
  user?: User;
  authenticated?: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Stats Types
export interface Stats {
  parts: {
    total: number;
    processors: number;
    motherboards: number;
    ram: number;
    gpus: number;
    storage: number;
    power_supplies: number;
  };
  builds: number;
  users: number;
}
