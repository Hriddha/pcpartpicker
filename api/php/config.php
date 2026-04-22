<?php
/**
 * Database Configuration for PC Part Picker
 * This file contains the database connection settings
 */

// Database credentials - Update these with your actual MySQL credentials
define('DB_HOST', 'sql311.infinityfree.com ');
define('DB_NAME', 'if0_41721703_pcpartpicker ');
define('DB_USER', 'if0_41721703');
define('DB_PASS', 'RudraSaha12');
define('DB_CHARSET', 'utf8mb4');

// CORS Headers for API access
header('Access-Control-Allow-Origin: https://pcpartpicker-eight.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Database Connection Class
 */
class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}

/**
 * Helper function to send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

/**
 * Helper function to get request body as JSON
 */
function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true);
}
