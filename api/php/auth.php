<?php
/**
 * Authentication API for PC Part Picker
 * Uses JWT tokens instead of sessions for cross-domain compatibility
 */

require_once 'config.php';

// ─── JWT Helpers ─────────────────────────────────────────────────────────────

define('JWT_SECRET', 'CHANGE_THIS_TO_A_LONG_RANDOM_STRING_abc123xyz');
define('JWT_EXPIRY', 60 * 60 * 24 * 7); // 7 days

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}
function createJWT($payload) {
    $header    = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['exp'] = time() + JWT_EXPIRY;
    $payload['iat'] = time();
    $body      = base64UrlEncode(json_encode($payload));
    $signature = base64UrlEncode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$signature";
}
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $signature] = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $signature)) return null;
    $payload = json_decode(base64UrlDecode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;
    return $payload;
}
function getTokenFromHeader() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (str_starts_with($auth, 'Bearer ')) return substr($auth, 7);
    return null;
}

// ─── Routing ──────────────────────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'POST':
        if ($action === 'register')     registerUser();
        elseif ($action === 'login')    loginUser();
        elseif ($action === 'logout')   sendResponse(['message' => 'Logout successful']); // client deletes token
        else                            sendResponse(['error' => 'Invalid action'], 400);
        break;
    case 'GET':
        if ($action === 'check')        checkToken();
        elseif ($action === 'user')     getCurrentUser();
        else                            sendResponse(['error' => 'Invalid action'], 400);
        break;
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function registerUser() {
    $data = getRequestBody();
    if (empty($data['username']) || empty($data['email']) || empty($data['password']))
        sendResponse(['error' => 'Username, email, and password are required'], 400);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
        sendResponse(['error' => 'Invalid email format'], 400);
    if (strlen($data['password']) < 8)
        sendResponse(['error' => 'Password must be at least 8 characters'], 400);

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$data['username'], $data['email']]);
    if ($stmt->fetch()) sendResponse(['error' => 'Username or email already exists'], 409);

    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
       ->execute([$data['username'], $data['email'], $hash]);
    $userId = $db->lastInsertId();

    $roleStmt = $db->prepare("SELECT role_id FROM roles WHERE role_name = 'user' LIMIT 1");
    $roleStmt->execute();
    $role = $roleStmt->fetch();
    if ($role) $db->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$userId, $role['role_id']]);

    $token = createJWT(['user_id' => $userId, 'username' => $data['username'], 'email' => $data['email']]);
    sendResponse(['message' => 'Registration successful', 'token' => $token, 'user' => ['user_id' => $userId, 'username' => $data['username'], 'email' => $data['email'], 'roles' => ['user']]], 201);
}

function loginUser() {
    $data = getRequestBody();
    if (empty($data['email']) || empty($data['password']))
        sendResponse(['error' => 'Email and password are required'], 400);

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT user_id, username, email, password_hash FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password_hash']))
        sendResponse(['error' => 'Invalid email or password'], 401);

    $roleStmt = $db->prepare("SELECT r.role_name FROM roles r JOIN user_roles ur ON r.role_id = ur.role_id WHERE ur.user_id = ?");
    $roleStmt->execute([$user['user_id']]);
    $roles = $roleStmt->fetchAll(PDO::FETCH_COLUMN);

    $token = createJWT(['user_id' => $user['user_id'], 'username' => $user['username'], 'email' => $user['email']]);
    sendResponse(['message' => 'Login successful', 'token' => $token, 'user' => ['user_id' => $user['user_id'], 'username' => $user['username'], 'email' => $user['email'], 'roles' => $roles]]);
}

function checkToken() {
    $token = getTokenFromHeader();
    if (!$token) { sendResponse(['authenticated' => false]); }
    $payload = verifyJWT($token);
    if (!$payload) { sendResponse(['authenticated' => false]); }
    sendResponse(['authenticated' => true, 'user' => ['user_id' => $payload['user_id'], 'username' => $payload['username'], 'email' => $payload['email'], 'roles' => ['user']]]);
}

function getCurrentUser() {
    $token = getTokenFromHeader();
    if (!$token) sendResponse(['error' => 'Not authenticated'], 401);
    $payload = verifyJWT($token);
    if (!$payload) sendResponse(['error' => 'Invalid or expired token'], 401);

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT user_id, username, email, created_at FROM users WHERE user_id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    if (!$user) sendResponse(['error' => 'User not found'], 404);

    $buildStmt = $db->prepare("SELECT COUNT(*) as count FROM pc_builds WHERE user_id = ?");
    $buildStmt->execute([$user['user_id']]);
    $buildCount = $buildStmt->fetch()['count'];

    sendResponse(['user' => array_merge($user, ['roles' => ['user'], 'build_count' => (int)$buildCount])]);
}