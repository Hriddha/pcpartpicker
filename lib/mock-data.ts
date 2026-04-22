/**
 * Mock data for PC Part Picker
 * Used for demo purposes when PHP backend is not available
 */

import type { Processor, Motherboard, RAM, GPU, Storage, PowerSupply } from './types';

export const mockProcessors: Processor[] = [
  { processor_id: 1, name: 'AMD Ryzen 9 7950X', socket_type: 'AM5', cores: 16, threads: 32, base_clock: 4.5, boost_clock: 5.7, tdp: 170 },
  { processor_id: 2, name: 'AMD Ryzen 7 7800X3D', socket_type: 'AM5', cores: 8, threads: 16, base_clock: 4.2, boost_clock: 5.0, tdp: 120 },
  { processor_id: 3, name: 'AMD Ryzen 5 7600X', socket_type: 'AM5', cores: 6, threads: 12, base_clock: 4.7, boost_clock: 5.3, tdp: 105 },
  { processor_id: 4, name: 'Intel Core i9-14900K', socket_type: 'LGA1700', cores: 24, threads: 32, base_clock: 3.2, boost_clock: 6.0, tdp: 253 },
  { processor_id: 5, name: 'Intel Core i7-14700K', socket_type: 'LGA1700', cores: 20, threads: 28, base_clock: 3.4, boost_clock: 5.6, tdp: 253 },
  { processor_id: 6, name: 'Intel Core i5-14600K', socket_type: 'LGA1700', cores: 14, threads: 20, base_clock: 3.5, boost_clock: 5.3, tdp: 181 },
  { processor_id: 7, name: 'AMD Ryzen 9 5900X', socket_type: 'AM4', cores: 12, threads: 24, base_clock: 3.7, boost_clock: 4.8, tdp: 105 },
  { processor_id: 8, name: 'Intel Core i5-12400F', socket_type: 'LGA1700', cores: 6, threads: 12, base_clock: 2.5, boost_clock: 4.4, tdp: 117 },
];

export const mockMotherboards: Motherboard[] = [
  { motherboard_id: 1, name: 'ASUS ROG Crosshair X670E Hero', socket_type: 'AM5', chipset: 'X670E', form_factor: 'ATX', ram_slots: 4, max_ram: '128GB' },
  { motherboard_id: 2, name: 'MSI MAG X670E TOMAHAWK', socket_type: 'AM5', chipset: 'X670E', form_factor: 'ATX', ram_slots: 4, max_ram: '128GB' },
  { motherboard_id: 3, name: 'Gigabyte B650 AORUS Elite AX', socket_type: 'AM5', chipset: 'B650', form_factor: 'ATX', ram_slots: 4, max_ram: '128GB' },
  { motherboard_id: 4, name: 'ASUS ROG Maximus Z790 Hero', socket_type: 'LGA1700', chipset: 'Z790', form_factor: 'ATX', ram_slots: 4, max_ram: '192GB' },
  { motherboard_id: 5, name: 'MSI MPG Z790 Carbon WiFi', socket_type: 'LGA1700', chipset: 'Z790', form_factor: 'ATX', ram_slots: 4, max_ram: '128GB' },
  { motherboard_id: 6, name: 'Gigabyte B660M DS3H', socket_type: 'LGA1700', chipset: 'B660', form_factor: 'mATX', ram_slots: 2, max_ram: '64GB' },
  { motherboard_id: 7, name: 'ASUS TUF Gaming B550-PLUS', socket_type: 'AM4', chipset: 'B550', form_factor: 'ATX', ram_slots: 4, max_ram: '128GB' },
  { motherboard_id: 8, name: 'MSI B550M PRO-VDH WiFi', socket_type: 'AM4', chipset: 'B550', form_factor: 'mATX', ram_slots: 4, max_ram: '128GB' },
];

export const mockRAM: RAM[] = [
  { ram_id: 1, name: 'G.Skill Trident Z5 RGB', type: 'DDR5', capacity: '32GB', speed: '6000MHz' },
  { ram_id: 2, name: 'Corsair Dominator Platinum RGB', type: 'DDR5', capacity: '64GB', speed: '5600MHz' },
  { ram_id: 3, name: 'Kingston Fury Beast', type: 'DDR5', capacity: '16GB', speed: '5200MHz' },
  { ram_id: 4, name: 'G.Skill Ripjaws V', type: 'DDR4', capacity: '32GB', speed: '3600MHz' },
  { ram_id: 5, name: 'Corsair Vengeance LPX', type: 'DDR4', capacity: '16GB', speed: '3200MHz' },
  { ram_id: 6, name: 'Team T-Force Delta RGB', type: 'DDR4', capacity: '32GB', speed: '3600MHz' },
  { ram_id: 7, name: 'Crucial Ballistix', type: 'DDR4', capacity: '64GB', speed: '3200MHz' },
  { ram_id: 8, name: 'G.Skill Trident Z Neo', type: 'DDR4', capacity: '32GB', speed: '3600MHz' },
];

export const mockGPUs: GPU[] = [
  { gpu_id: 1, name: 'NVIDIA GeForce RTX 4090', vram: 24, tdp: 450 },
  { gpu_id: 2, name: 'NVIDIA GeForce RTX 4080 Super', vram: 16, tdp: 320 },
  { gpu_id: 3, name: 'NVIDIA GeForce RTX 4070 Ti Super', vram: 16, tdp: 285 },
  { gpu_id: 4, name: 'NVIDIA GeForce RTX 4070', vram: 12, tdp: 200 },
  { gpu_id: 5, name: 'AMD Radeon RX 7900 XTX', vram: 24, tdp: 355 },
  { gpu_id: 6, name: 'AMD Radeon RX 7900 XT', vram: 20, tdp: 315 },
  { gpu_id: 7, name: 'AMD Radeon RX 7800 XT', vram: 16, tdp: 263 },
  { gpu_id: 8, name: 'NVIDIA GeForce RTX 4060 Ti', vram: 8, tdp: 160 },
];

export const mockStorage: Storage[] = [
  { storage_id: 1, name: 'Samsung 990 Pro 2TB', type: 'NVMe', capacity: '2TB', interface: 'PCIe 4.0 x4' },
  { storage_id: 2, name: 'WD Black SN850X 1TB', type: 'NVMe', capacity: '1TB', interface: 'PCIe 4.0 x4' },
  { storage_id: 3, name: 'Crucial P5 Plus 2TB', type: 'NVMe', capacity: '2TB', interface: 'PCIe 4.0 x4' },
  { storage_id: 4, name: 'Samsung 870 EVO 1TB', type: 'SSD', capacity: '1TB', interface: 'SATA III' },
  { storage_id: 5, name: 'Seagate Barracuda 4TB', type: 'HDD', capacity: '4TB', interface: 'SATA III' },
  { storage_id: 6, name: 'WD Blue 2TB', type: 'HDD', capacity: '2TB', interface: 'SATA III' },
  { storage_id: 7, name: 'Sabrent Rocket 4 Plus 1TB', type: 'NVMe', capacity: '1TB', interface: 'PCIe 4.0 x4' },
  { storage_id: 8, name: 'Kingston NV2 500GB', type: 'NVMe', capacity: '500GB', interface: 'PCIe 4.0 x4' },
];

export const mockPowerSupplies: PowerSupply[] = [
  { psu_id: 1, name: 'Corsair RM1000x', wattage: 1000, efficiency_rating: '80+ Gold' },
  { psu_id: 2, name: 'EVGA SuperNOVA 850 G6', wattage: 850, efficiency_rating: '80+ Gold' },
  { psu_id: 3, name: 'Seasonic Focus GX-750', wattage: 750, efficiency_rating: '80+ Gold' },
  { psu_id: 4, name: 'be quiet! Straight Power 12 850W', wattage: 850, efficiency_rating: '80+ Platinum' },
  { psu_id: 5, name: 'Corsair HX1200', wattage: 1200, efficiency_rating: '80+ Platinum' },
  { psu_id: 6, name: 'NZXT C650', wattage: 650, efficiency_rating: '80+ Gold' },
  { psu_id: 7, name: 'Thermaltake Toughpower GF1 850W', wattage: 850, efficiency_rating: '80+ Gold' },
  { psu_id: 8, name: 'Cooler Master V750 SFX', wattage: 750, efficiency_rating: '80+ Gold' },
];

// Helper function to check compatibility locally
export function checkLocalCompatibility(parts: {
  processor?: { socket_type: string; tdp: number } | null;
  motherboard?: { socket_type: string; max_ram: string } | null;
  ram?: { capacity: string } | null;
  gpu?: { tdp: number } | null;
  psu?: { wattage: number } | null;
}) {
  const issues: Array<{ type: string; severity: 'error' | 'warning'; message: string }> = [];
  const warnings: Array<{ type: string; severity: 'error' | 'warning'; message: string }> = [];

  // Check CPU-Motherboard socket compatibility
  if (parts.processor && parts.motherboard) {
    if (parts.processor.socket_type !== parts.motherboard.socket_type) {
      issues.push({
        type: 'socket_mismatch',
        severity: 'error',
        message: `CPU socket (${parts.processor.socket_type}) does not match motherboard socket (${parts.motherboard.socket_type})`,
      });
    }
  }

  // Check RAM capacity vs motherboard max
  if (parts.ram && parts.motherboard) {
    const ramCapacity = parseInt(parts.ram.capacity);
    const maxRam = parseInt(parts.motherboard.max_ram);
    if (ramCapacity > maxRam) {
      issues.push({
        type: 'ram_capacity',
        severity: 'error',
        message: `RAM capacity (${parts.ram.capacity}) exceeds motherboard maximum (${parts.motherboard.max_ram})`,
      });
    }
  }

  // Calculate power requirements
  let totalTdp = 0;
  if (parts.processor) totalTdp += parts.processor.tdp;
  if (parts.gpu) totalTdp += parts.gpu.tdp;
  const estimatedOther = 100;
  const totalPower = totalTdp + estimatedOther;
  const recommendedPsu = Math.ceil(totalPower * 1.2);

  if (parts.psu) {
    if (parts.psu.wattage < totalPower) {
      issues.push({
        type: 'psu_insufficient',
        severity: 'error',
        message: `PSU wattage (${parts.psu.wattage}W) is insufficient for estimated power draw (${totalPower}W)`,
      });
    } else if (parts.psu.wattage < recommendedPsu) {
      warnings.push({
        type: 'psu_low_headroom',
        severity: 'warning',
        message: `PSU wattage (${parts.psu.wattage}W) provides minimal headroom. Recommended: ${recommendedPsu}W`,
      });
    }
  }

  // Calculate performance score
  let score = 0;
  const breakdown: { cpu?: number; gpu?: number; ram?: number } = {};

  if (parts.processor) {
    const cpuScore = 200 + parts.processor.tdp;
    score += cpuScore;
    breakdown.cpu = cpuScore;
  }
  if (parts.gpu) {
    const gpuScore = parts.gpu.tdp * 2;
    score += gpuScore;
    breakdown.gpu = gpuScore;
  }
  if (parts.ram) {
    const ramScore = parseInt(parts.ram.capacity) * 3;
    score += ramScore;
    breakdown.ram = ramScore;
  }

  let tier = 'Entry Level';
  if (score > 1000) tier = 'Enthusiast';
  else if (score > 700) tier = 'High End';
  else if (score > 400) tier = 'Mid Range';

  return {
    compatible: issues.length === 0,
    issues,
    warnings,
    power_analysis: {
      cpu_tdp: parts.processor?.tdp || 0,
      gpu_tdp: parts.gpu?.tdp || 0,
      estimated_other: estimatedOther,
      total_estimated: totalPower,
      recommended_psu: recommendedPsu,
      psu_wattage: parts.psu?.wattage || null,
    },
    performance: {
      score,
      tier,
      breakdown,
    },
  };
}
