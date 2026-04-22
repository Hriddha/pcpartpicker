<?php
/**
 * Storage API Endpoint
 * Handles CRUD operations for Storage devices (SSD, HDD, NVMe)
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM storage WHERE storage_id = ?");
            $stmt->execute([$_GET['id']]);
            $storage = $stmt->fetch();
            
            if ($storage) {
                sendResponse($storage);
            } else {
                sendResponse(['error' => 'Storage not found'], 404);
            }
        } else {
            // Optional filtering by type (SSD, HDD, NVMe)
            if (isset($_GET['type'])) {
                $stmt = $db->prepare("SELECT * FROM storage WHERE type = ? ORDER BY name");
                $stmt->execute([$_GET['type']]);
            } else {
                $stmt = $db->query("SELECT * FROM storage ORDER BY name");
            }
            $storage = $stmt->fetchAll();
            sendResponse($storage);
        }
        break;

    case 'POST':
        $data = getRequestBody();
        
        if (!isset($data['name'], $data['type'], $data['capacity'], $data['interface'])) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO storage (name, type, capacity, interface) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['type'],
            $data['capacity'],
            $data['interface']
        ]);
        
        sendResponse(['message' => 'Storage created', 'id' => $db->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Storage ID required'], 400);
        }
        
        $data = getRequestBody();
        $stmt = $db->prepare("UPDATE storage SET name = ?, type = ?, capacity = ?, interface = ? WHERE storage_id = ?");
        $stmt->execute([
            $data['name'],
            $data['type'],
            $data['capacity'],
            $data['interface'],
            $_GET['id']
        ]);
        
        sendResponse(['message' => 'Storage updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Storage ID required'], 400);
        }
        
        $stmt = $db->prepare("DELETE FROM storage WHERE storage_id = ?");
        $stmt->execute([$_GET['id']]);
        
        sendResponse(['message' => 'Storage deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
