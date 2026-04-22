<?php
/**
 * GPUs API Endpoint
 * Handles CRUD operations for Graphics Cards
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM gpus WHERE gpu_id = ?");
            $stmt->execute([$_GET['id']]);
            $gpu = $stmt->fetch();
            
            if ($gpu) {
                sendResponse($gpu);
            } else {
                sendResponse(['error' => 'GPU not found'], 404);
            }
        } else {
            // Optional filtering by VRAM
            if (isset($_GET['min_vram'])) {
                $stmt = $db->prepare("SELECT * FROM gpus WHERE vram >= ? ORDER BY name");
                $stmt->execute([$_GET['min_vram']]);
            } else {
                $stmt = $db->query("SELECT * FROM gpus ORDER BY name");
            }
            $gpus = $stmt->fetchAll();
            sendResponse($gpus);
        }
        break;

    case 'POST':
        $data = getRequestBody();
        
        if (!isset($data['name'], $data['vram'], $data['tdp'])) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO gpus (name, vram, tdp) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['vram'],
            $data['tdp']
        ]);
        
        sendResponse(['message' => 'GPU created', 'id' => $db->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'GPU ID required'], 400);
        }
        
        $data = getRequestBody();
        $stmt = $db->prepare("UPDATE gpus SET name = ?, vram = ?, tdp = ? WHERE gpu_id = ?");
        $stmt->execute([
            $data['name'],
            $data['vram'],
            $data['tdp'],
            $_GET['id']
        ]);
        
        sendResponse(['message' => 'GPU updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'GPU ID required'], 400);
        }
        
        $stmt = $db->prepare("DELETE FROM gpus WHERE gpu_id = ?");
        $stmt->execute([$_GET['id']]);
        
        sendResponse(['message' => 'GPU deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
