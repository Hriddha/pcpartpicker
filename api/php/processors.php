<?php
/**
 * Processors API Endpoint
 * Handles CRUD operations for CPU/Processors
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all processors or specific processor by ID
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM processors WHERE processor_id = ?");
            $stmt->execute([$_GET['id']]);
            $processor = $stmt->fetch();
            
            if ($processor) {
                sendResponse($processor);
            } else {
                sendResponse(['error' => 'Processor not found'], 404);
            }
        } else {
            // Optional filtering by socket type
            if (isset($_GET['socket_type'])) {
                $stmt = $db->prepare("SELECT * FROM processors WHERE socket_type = ? ORDER BY name");
                $stmt->execute([$_GET['socket_type']]);
            } else {
                $stmt = $db->query("SELECT * FROM processors ORDER BY name");
            }
            $processors = $stmt->fetchAll();
            sendResponse($processors);
        }
        break;

    case 'POST':
        // Create new processor
        $data = getRequestBody();
        
        if (!isset($data['name'], $data['socket_type'], $data['cores'], $data['threads'], $data['base_clock'], $data['boost_clock'], $data['tdp'])) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO processors (name, socket_type, cores, threads, base_clock, boost_clock, tdp) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['socket_type'],
            $data['cores'],
            $data['threads'],
            $data['base_clock'],
            $data['boost_clock'],
            $data['tdp']
        ]);
        
        sendResponse(['message' => 'Processor created', 'id' => $db->lastInsertId()], 201);
        break;

    case 'PUT':
        // Update processor
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Processor ID required'], 400);
        }
        
        $data = getRequestBody();
        $stmt = $db->prepare("UPDATE processors SET name = ?, socket_type = ?, cores = ?, threads = ?, base_clock = ?, boost_clock = ?, tdp = ? WHERE processor_id = ?");
        $stmt->execute([
            $data['name'],
            $data['socket_type'],
            $data['cores'],
            $data['threads'],
            $data['base_clock'],
            $data['boost_clock'],
            $data['tdp'],
            $_GET['id']
        ]);
        
        sendResponse(['message' => 'Processor updated']);
        break;

    case 'DELETE':
        // Delete processor
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Processor ID required'], 400);
        }
        
        $stmt = $db->prepare("DELETE FROM processors WHERE processor_id = ?");
        $stmt->execute([$_GET['id']]);
        
        sendResponse(['message' => 'Processor deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
