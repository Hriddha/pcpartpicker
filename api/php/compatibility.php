<?php
/**
 * Compatibility Check API Endpoint
 * Validates component compatibility for PC builds
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$data = getRequestBody();
$issues = [];
$warnings = [];

// Get component details if IDs are provided
$processor = null;
$motherboard = null;
$ram = null;
$gpu = null;
$psu = null;

if (!empty($data['processor_id'])) {
    $stmt = $db->prepare("SELECT * FROM processors WHERE processor_id = ?");
    $stmt->execute([$data['processor_id']]);
    $processor = $stmt->fetch();
}

if (!empty($data['motherboard_id'])) {
    $stmt = $db->prepare("SELECT * FROM motherboards WHERE motherboard_id = ?");
    $stmt->execute([$data['motherboard_id']]);
    $motherboard = $stmt->fetch();
}

if (!empty($data['ram_id'])) {
    $stmt = $db->prepare("SELECT * FROM ram WHERE ram_id = ?");
    $stmt->execute([$data['ram_id']]);
    $ram = $stmt->fetch();
}

if (!empty($data['gpu_id'])) {
    $stmt = $db->prepare("SELECT * FROM gpus WHERE gpu_id = ?");
    $stmt->execute([$data['gpu_id']]);
    $gpu = $stmt->fetch();
}

if (!empty($data['psu_id'])) {
    $stmt = $db->prepare("SELECT * FROM power_supplies WHERE psu_id = ?");
    $stmt->execute([$data['psu_id']]);
    $psu = $stmt->fetch();
}

// Check CPU and Motherboard socket compatibility
if ($processor && $motherboard) {
    if ($processor['socket_type'] !== $motherboard['socket_type']) {
        $issues[] = [
            'type' => 'socket_mismatch',
            'severity' => 'error',
            'message' => "CPU socket ({$processor['socket_type']}) does not match motherboard socket ({$motherboard['socket_type']})"
        ];
    }
}

// Check RAM capacity against motherboard max RAM
if ($ram && $motherboard) {
    $ramCapacity = (int) filter_var($ram['capacity'], FILTER_SANITIZE_NUMBER_INT);
    $maxRam = (int) filter_var($motherboard['max_ram'], FILTER_SANITIZE_NUMBER_INT);
    
    if ($ramCapacity > $maxRam) {
        $issues[] = [
            'type' => 'ram_capacity',
            'severity' => 'error',
            'message' => "RAM capacity ({$ram['capacity']}) exceeds motherboard maximum ({$motherboard['max_ram']})"
        ];
    }
}

// Calculate total TDP and check PSU wattage
$totalTdp = 0;
if ($processor) {
    $totalTdp += (int) $processor['tdp'];
}
if ($gpu) {
    $totalTdp += (int) $gpu['tdp'];
}

// Add estimated power for other components (motherboard, RAM, storage, fans)
$estimatedOtherPower = 100; // Rough estimate in watts
$totalEstimatedPower = $totalTdp + $estimatedOtherPower;

// Recommend 20% headroom for PSU
$recommendedWattage = $totalEstimatedPower * 1.2;

if ($psu) {
    $psuWattage = (int) $psu['wattage'];
    
    if ($psuWattage < $totalEstimatedPower) {
        $issues[] = [
            'type' => 'psu_insufficient',
            'severity' => 'error',
            'message' => "PSU wattage ({$psuWattage}W) is insufficient for estimated power draw ({$totalEstimatedPower}W)"
        ];
    } elseif ($psuWattage < $recommendedWattage) {
        $warnings[] = [
            'type' => 'psu_low_headroom',
            'severity' => 'warning',
            'message' => "PSU wattage ({$psuWattage}W) provides minimal headroom. Recommended: {$recommendedWattage}W"
        ];
    }
}

// Performance estimation (basic scoring)
$performanceScore = 0;
$performanceBreakdown = [];

if ($processor) {
    $cpuScore = ($processor['cores'] * 10) + ($processor['threads'] * 5) + ($processor['boost_clock'] * 20);
    $performanceScore += $cpuScore;
    $performanceBreakdown['cpu'] = $cpuScore;
}

if ($gpu) {
    $gpuScore = $gpu['vram'] * 50;
    $performanceScore += $gpuScore;
    $performanceBreakdown['gpu'] = $gpuScore;
}

if ($ram) {
    $ramCapacity = (int) filter_var($ram['capacity'], FILTER_SANITIZE_NUMBER_INT);
    $ramSpeed = (int) filter_var($ram['speed'], FILTER_SANITIZE_NUMBER_INT);
    $ramScore = ($ramCapacity * 2) + ($ramSpeed / 100);
    $performanceScore += $ramScore;
    $performanceBreakdown['ram'] = round($ramScore);
}

// Determine performance tier
$performanceTier = 'Entry Level';
if ($performanceScore > 1000) {
    $performanceTier = 'Enthusiast';
} elseif ($performanceScore > 700) {
    $performanceTier = 'High End';
} elseif ($performanceScore > 400) {
    $performanceTier = 'Mid Range';
}

sendResponse([
    'compatible' => count($issues) === 0,
    'issues' => $issues,
    'warnings' => $warnings,
    'power_analysis' => [
        'cpu_tdp' => $processor ? (int) $processor['tdp'] : 0,
        'gpu_tdp' => $gpu ? (int) $gpu['tdp'] : 0,
        'estimated_other' => $estimatedOtherPower,
        'total_estimated' => $totalEstimatedPower,
        'recommended_psu' => round($recommendedWattage),
        'psu_wattage' => $psu ? (int) $psu['wattage'] : null
    ],
    'performance' => [
        'score' => round($performanceScore),
        'tier' => $performanceTier,
        'breakdown' => $performanceBreakdown
    ]
]);
