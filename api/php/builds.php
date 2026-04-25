<?php
/**
 * PC Builds API Endpoint (SECURE VERSION)
 * Uses JWT authentication instead of trusting frontend user_id
 */

require_once 'config.php';
require_once 'auth.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Get authenticated user ID from JWT
 */
function getAuthenticatedUserId() {
    $token = getAuthToken();
    if (!$token) return null;

    $payload = verifyJWT($token);
    if (!$payload) return null;

    return $payload['user_id'];
}

switch ($method) {

    // ========================= GET =========================
    case 'GET':
        if (isset($_GET['id'])) {
            // Get specific build
            $stmt = $db->prepare("
                SELECT 
                    b.*,
                    p.name as processor_name,
                    m.name as motherboard_name,
                    r.name as ram_name,
                    g.name as gpu_name,
                    s.name as storage_name,
                    ps.name as psu_name, ps.wattage
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

            if ($build) sendResponse($build);
            else sendResponse(['error' => 'Build not found'], 404);

        } elseif (isset($_GET['user_id'])) {
            // Get builds by user (OPTIONAL: can restrict later)
            $stmt = $db->prepare("
                SELECT 
                    b.*,
                    p.name as processor_name,
                    g.name as gpu_name,
                    r.name as ram_name,
                    s.name as storage_name,
                    ps.name as psu_name, ps.wattage
                FROM builds b
                LEFT JOIN processors p ON b.processor_id = p.processor_id
                LEFT JOIN gpus g ON b.gpu_id = g.gpu_id
                LEFT JOIN ram r ON b.ram_id = r.ram_id
                LEFT JOIN storage s ON b.storage_id = s.storage_id
                LEFT JOIN power_supplies ps ON b.psu_id = ps.psu_id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
            ");
            $stmt->execute([$_GET['user_id']]);
            sendResponse($stmt->fetchAll());

        } else {
            // Get all builds
            $stmt = $db->query("
                SELECT 
                    b.*,
                    p.name as processor_name,
                    g.name as gpu_name,
                    r.name as ram_name,
                    s.name as storage_name,
                    ps.name as psu_name, ps.wattage
                FROM builds b
                LEFT JOIN processors p ON b.processor_id = p.processor_id
                LEFT JOIN gpus g ON b.gpu_id = g.gpu_id
                LEFT JOIN ram r ON b.ram_id = r.ram_id
                LEFT JOIN storage s ON b.storage_id = s.storage_id
                LEFT JOIN power_supplies ps ON b.psu_id = ps.psu_id
                ORDER BY b.created_at DESC
                LIMIT 50
            ");
            sendResponse($stmt->fetchAll());
        }
        break;

    // ========================= POST =========================
    case 'POST':
        $user_id = getAuthenticatedUserId();

        if (!$user_id) {
            sendResponse(['error' => 'Unauthorized'], 401);
        }

        $data = getRequestBody();

        if (!isset($data['build_name'])) {
            sendResponse(['error' => 'Build name is required'], 400);
        }

        $stmt = $db->prepare("
            INSERT INTO builds 
            (user_id, build_name, processor_id, motherboard_id, ram_id, gpu_id, storage_id, psu_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");

        $stmt->execute([
            $user_id,
            $data['build_name'],
            $data['processor_id'] ?? null,
            $data['motherboard_id'] ?? null,
            $data['ram_id'] ?? null,
            $data['gpu_id'] ?? null,
            $data['storage_id'] ?? null,
            $data['psu_id'] ?? null,
        ]);

        sendResponse([
            'message' => 'Build created',
            'id' => (int)$db->lastInsertId()
        ], 201);
        break;

    // ========================= PUT =========================
    case 'PUT':
        $user_id = getAuthenticatedUserId();

        if (!$user_id) {
            sendResponse(['error' => 'Unauthorized'], 401);
        }

        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Build ID required'], 400);
        }

        $data = getRequestBody();

        // Ensure user owns the build
        $stmt = $db->prepare("SELECT user_id FROM builds WHERE build_id = ?");
        $stmt->execute([$_GET['id']]);
        $build = $stmt->fetch();

        if (!$build || $build['user_id'] != $user_id) {
            sendResponse(['error' => 'Forbidden'], 403);
        }

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

    // ========================= DELETE =========================
    case 'DELETE':
        $user_id = getAuthenticatedUserId();

        if (!$user_id) {
            sendResponse(['error' => 'Unauthorized'], 401);
        }

        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Build ID required'], 400);
        }

        // Ensure user owns the build
        $stmt = $db->prepare("SELECT user_id FROM builds WHERE build_id = ?");
        $stmt->execute([$_GET['id']]);
        $build = $stmt->fetch();

        if (!$build || $build['user_id'] != $user_id) {
            sendResponse(['error' => 'Forbidden'], 403);
        }

        $stmt = $db->prepare("DELETE FROM builds WHERE build_id = ?");
        $stmt->execute([$_GET['id']]);

        sendResponse(['message' => 'Build deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}