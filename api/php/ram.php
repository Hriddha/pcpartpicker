<?php
/**
 * RAM API Endpoint
 * Handles CRUD operations for Memory/RAM
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM ram WHERE ram_id = ?");
            $stmt->execute([$_GET['id']]);
            $ram = $stmt->fetch();
            
            if ($ram) {
                sendResponse($ram);
            } else {
                sendResponse(['error' => 'RAM not found'], 404);
            }
        } else {
            // Optional filtering by type (DDR4, DDR5, etc.)
            if (isset($_GET['type'])) {
                $stmt = $db->prepare("SELECT * FROM ram WHERE type = ? ORDER BY name");
                $stmt->execute([$_GET['type']]);
            } else {
                $stmt = $db->query("SELECT * FROM ram ORDER BY name");
            }
            $ram = $stmt->fetchAll();
            sendResponse($ram);
        }
        break;

    case 'POST':
        $data = getRequestBody();
        
        if (!isset($data['name'], $data['type'], $data['capacity'], $data['speed'])) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO ram (name, type, capacity, speed) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['type'],
            $data['capacity'],
            $data['speed']
        ]);
        
        sendResponse(['message' => 'RAM created', 'id' => $db->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'RAM ID required'], 400);
        }
        
        $data = getRequestBody();
        $stmt = $db->prepare("UPDATE ram SET name = ?, type = ?, capacity = ?, speed = ? WHERE ram_id = ?");
        $stmt->execute([
            $data['name'],
            $data['type'],
            $data['capacity'],
            $data['speed'],
            $_GET['id']
        ]);
        
        sendResponse(['message' => 'RAM updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'RAM ID required'], 400);
        }
        
        $stmt = $db->prepare("DELETE FROM ram WHERE ram_id = ?");
        $stmt->execute([$_GET['id']]);
        
        sendResponse(['message' => 'RAM deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
