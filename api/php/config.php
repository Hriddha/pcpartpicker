<?php
ob_start();

// Convert ALL errors/exceptions to clean JSON — never leak HTML to the client
set_exception_handler(function (Throwable $e) {
    if (ob_get_level()) ob_clean();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
    exit();
});
error_reporting(0);
ini_set('display_errors', '0');

// ─── Database ─────────────────────────────────────────────────────────────────
define('DB_HOST',    getenv('MYSQLHOST')     ?: 'mysql.railway.internal');
define('DB_NAME',    getenv('MYSQLDATABASE') ?: 'railway');
define('DB_USER',    getenv('MYSQLUSER')     ?: 'root');
define('DB_PASS',    getenv('MYSQLPASSWORD') ?: 'ttwjFamNSBqjvpcpGhsZJCMXbaJpCndv');
define('DB_PORT',    getenv('MYSQLPORT')     ?: '3306');
define('DB_CHARSET', 'utf8mb4');

// ─── CORS ─────────────────────────────────────────────────────────────────────
// To allow multiple origins set ALLOWED_ORIGIN env var as comma-separated list:
// e.g. https://pcpartpicker-eight.vercel.app,http://localhost:3000
$allowedOrigins = array_filter(array_map('trim', explode(',',
    getenv('ALLOWED_ORIGIN') ?: 'https://pcpartpicker-eight.vercel.app,http://localhost:3000'
)));

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($requestOrigin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
} else {
    // Fallback to primary allowed origin
    header('Access-Control-Allow-Origin: ' . reset($allowedOrigins));
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}
// ──────────────────────────────────────────────────────────────────────────────

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
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

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true);
}