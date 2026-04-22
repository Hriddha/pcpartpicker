<?php
/**
 * Power Supplies API Endpoint
 * Handles CRUD operations for PSUs
 */
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM power_supplies WHERE psu_id = ?");
            $stmt->execute([$_GET['id']]);
            $psu = $stmt->fetch();
            
            if ($psu) {
                sendResponse($psu);
            } else {
                sendResponse(['error' => 'Power supply not found'], 404);
            }
        } else {
            // Optional filtering by minimum wattage
            if (isset($_GET['min_wattage'])) {
                $stmt = $db->prepare("SELECT * FROM power_supplies WHERE wattage >= ? ORDER BY wattage ASC");
                $stmt->execute([$_GET['min_wattage']]);
            } else {
                $stmt = $db->query("SELECT * FROM power_supplies ORDER BY wattage ASC");
            }
            $psus = $stmt->fetchAll();
            sendResponse($psus);
        }
        break;

    case 'POST':
        $data = getRequestBody();
        
        if (!isset($data['name'], $data['wattage'], $data['efficiency_rating'])) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO power_supplies (name, wattage, efficiency_rating) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['wattage'],
            $data['efficiency_rating']
        ]);
        
        sendResponse(['message' => 'Power supply created', 'id' => $db->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'PSU ID required'], 400);
        }
        
        $data = getRequestBody();
        $stmt = $db->prepare("UPDATE power_supplies SET name = ?, wattage = ?, efficiency_rating = ? WHERE psu_id = ?");
        $stmt->execute([
            $data['name'],
            $data['wattage'],
            $data['efficiency_rating'],
            $_GET['id']
        ]);
        
        sendResponse(['message' => 'Power supply updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'PSU ID required'], 400);
        }
        
        $stmt = $db->prepare("DELETE FROM power_supplies WHERE psu_id = ?");
        $stmt->execute([$_GET['id']]);
        
        sendResponse(['message' => 'Power supply deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
