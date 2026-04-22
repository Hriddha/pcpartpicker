<?php
/**
 * Statistics API for PC Part Picker
 * Returns counts for parts, builds, and users
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$db = Database::getInstance()->getConnection();

// Count all parts
$processorCount = $db->query("SELECT COUNT(*) FROM processors")->fetchColumn();
$motherboardCount = $db->query("SELECT COUNT(*) FROM motherboards")->fetchColumn();
$ramCount = $db->query("SELECT COUNT(*) FROM ram")->fetchColumn();
$gpuCount = $db->query("SELECT COUNT(*) FROM gpus")->fetchColumn();
$storageCount = $db->query("SELECT COUNT(*) FROM storage")->fetchColumn();
$psuCount = $db->query("SELECT COUNT(*) FROM power_supplies")->fetchColumn();

$totalParts = $processorCount + $motherboardCount + $ramCount + $gpuCount + $storageCount + $psuCount;

// Count builds
$buildCount = $db->query("SELECT COUNT(*) FROM pc_builds")->fetchColumn();

// Count users
$userCount = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();

sendResponse([
    'parts' => [
        'total' => (int)$totalParts,
        'processors' => (int)$processorCount,
        'motherboards' => (int)$motherboardCount,
        'ram' => (int)$ramCount,
        'gpus' => (int)$gpuCount,
        'storage' => (int)$storageCount,
        'power_supplies' => (int)$psuCount
    ],
    'builds' => (int)$buildCount,
    'users' => (int)$userCount
]);
