<?php
/**
 * PC Builds API Endpoint
 * Handles CRUD operations for saved PC builds
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get specific build with all component details
            $stmt = $db->prepare("
                SELECT 
                    b.*,
                    p.name as processor_name, p.socket_type, p.cores, p.threads, p.base_clock, p.boost_clock, p.tdp as processor_tdp,
                    m.name as motherboard_name, m.chipset, m.form_factor, m.ram_slots, m.max_ram,
                    r.name as ram_name, r.type as ram_type, r.capacity as ram_capacity, r.speed as ram_speed,
                    g.name as gpu_name, g.vram, g.tdp as gpu_tdp,
                    s.name as storage_name, s.type as storage_type, s.capacity as storage_capacity, s.interface as storage_interface,
                    ps.name as psu_name, ps.wattage, ps.efficiency_rating
                FROM builds b
                LEFT JOIN processors p ON b.processor_id = p.processor_id
                LEFT JOIN motherboards m ON b.motherboard_id = m.motherboard_id
                LEFT JOIN ram r ON b.ram_id = r.ram_id
                LEFT JOIN gpus g ON b.gpu_id = g.gpu_id
                LEFT JOIN storage s ON b.storage_id = s.storage_id
                LEFT JOIN power_supplies ps ON b.psu_id = ps.psu_id
                WHERE b.build_id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $build = $stmt->fetch();

            if ($build) {
                sendResponse($build);
            } else {
                sendResponse(['error' => 'Build not found'], 404);
            }
        } elseif (isset($_GET['user_id'])) {
            // Get all builds for a specific user
            $stmt = $db->prepare("
                SELECT b.*, p.name as processor_name, g.name as gpu_name
                FROM builds b
                LEFT JOIN processors p ON b.processor_id = p.processor_id
                LEFT JOIN gpus g ON b.gpu_id = g.gpu_id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
            ");
            $stmt->execute([$_GET['user_id']]);
            $builds = $stmt->fetchAll();
            sendResponse($builds);
        } else {
            // Get all builds
            $stmt = $db->query("
                SELECT b.*, p.name as processor_name, g.name as gpu_name, u.username
                FROM builds b
                LEFT JOIN processors p ON b.processor_id = p.processor_id
                LEFT JOIN gpus g ON b.gpu_id = g.gpu_id
                LEFT JOIN users u ON b.user_id = u.user_id
                ORDER BY b.created_at DESC
                LIMIT 50
            ");
            $builds = $stmt->fetchAll();
            sendResponse($builds);
        }
        break;

    case 'POST':
        $data = getRequestBody();

        if (!isset($data['build_name'])) {
            sendResponse(['error' => 'Build name is required'], 400);
        }

        $stmt = $db->prepare("
            INSERT INTO builds (user_id, build_name, processor_id, motherboard_id, ram_id, gpu_id, storage_id, psu_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $data['user_id'] ?? null,
            $data['build_name'],
            $data['processor_id'] ?? null,
            $data['motherboard_id'] ?? null,
            $data['ram_id'] ?? null,
            $data['gpu_id'] ?? null,
            $data['storage_id'] ?? null,
            $data['psu_id'] ?? null,
        ]);

        sendResponse(['message' => 'Build created', 'id' => $db->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Build ID required'], 400);
        }

        $data = getRequestBody();
        $stmt = $db->prepare("
            UPDATE builds 
            SET build_name = ?, processor_id = ?, motherboard_id = ?, ram_id = ?, gpu_id = ?, storage_id = ?, psu_id = ?
            WHERE build_id = ?
        ");
        $stmt->execute([
            $data['build_name'],
            $data['processor_id'] ?? null,
            $data['motherboard_id'] ?? null,
            $data['ram_id'] ?? null,
            $data['gpu_id'] ?? null,
            $data['storage_id'] ?? null,
            $data['psu_id'] ?? null,
            $_GET['id'],
        ]);

        sendResponse(['message' => 'Build updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Build ID required'], 400);
        }

        $stmt = $db->prepare("DELETE FROM builds WHERE build_id = ?");
        $stmt->execute([$_GET['id']]);

        sendResponse(['message' => 'Build deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}