<?php
/**
 * Motherboards API Endpoint
 * Handles CRUD operations for Motherboards
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM motherboards WHERE motherboard_id = ?");
            $stmt->execute([$_GET['id']]);
            $motherboard = $stmt->fetch();
            
            if ($motherboard) {
                sendResponse($motherboard);
            } else {
                sendResponse(['error' => 'Motherboard not found'], 404);
            }
        } else {
            // Optional filtering by socket type for compatibility
            if (isset($_GET['socket_type'])) {
                $stmt = $db->prepare("SELECT * FROM motherboards WHERE socket_type = ? ORDER BY name");
                $stmt->execute([$_GET['socket_type']]);
            } else {
                $stmt = $db->query("SELECT * FROM motherboards ORDER BY name");
            }
            $motherboards = $stmt->fetchAll();
            sendResponse($motherboards);
        }
        break;

    case 'POST':
        $data = getRequestBody();
        
        if (!isset($data['name'], $data['socket_type'], $data['chipset'], $data['form_factor'], $data['ram_slots'], $data['max_ram'])) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO motherboards (name, socket_type, chipset, form_factor, ram_slots, max_ram) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['socket_type'],
            $data['chipset'],
            $data['form_factor'],
            $data['ram_slots'],
            $data['max_ram']
        ]);
        
        sendResponse(['message' => 'Motherboard created', 'id' => $db->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Motherboard ID required'], 400);
        }
        
        $data = getRequestBody();
        $stmt = $db->prepare("UPDATE motherboards SET name = ?, socket_type = ?, chipset = ?, form_factor = ?, ram_slots = ?, max_ram = ? WHERE motherboard_id = ?");
        $stmt->execute([
            $data['name'],
            $data['socket_type'],
            $data['chipset'],
            $data['form_factor'],
            $data['ram_slots'],
            $data['max_ram'],
            $_GET['id']
        ]);
        
        sendResponse(['message' => 'Motherboard updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Motherboard ID required'], 400);
        }
        
        $stmt = $db->prepare("DELETE FROM motherboards WHERE motherboard_id = ?");
        $stmt->execute([$_GET['id']]);
        
        sendResponse(['message' => 'Motherboard deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
