<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

define('JWT_SECRET', 'x9$kLm#pQr2vNw8zAb5cDe3fGh7jKn1o');
define('JWT_EXPIRY', 604800);

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}
function createJWT($payload) {
    $header = base64UrlEncode(json_encode(array('alg' => 'HS256', 'typ' => 'JWT')));
    $payload['exp'] = time() + JWT_EXPIRY;
    $payload['iat'] = time();
    $body = base64UrlEncode(json_encode($payload));
    $sig  = base64UrlEncode(hash_hmac('sha256', $header . '.' . $body, JWT_SECRET, true));
    return $header . '.' . $body . '.' . $sig;
}
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    $header = $parts[0]; $body = $parts[1]; $sig = $parts[2];
    $expected = base64UrlEncode(hash_hmac('sha256', $header . '.' . $body, JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64UrlDecode($body), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) return null;
    return $payload;
}

function getAuthToken() {
    $auth = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (strpos($auth, 'Bearer ') === 0) {
        return substr($auth, 7);
    }
    return null;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'POST':
        if ($action === 'register')   registerUser();
        elseif ($action === 'login')  loginUser();
        elseif ($action === 'logout') sendResponse(array('message' => 'Logout successful'));
        else sendResponse(array('error' => 'Invalid action'), 400);
        break;
    case 'GET':
        if ($action === 'check')     checkToken();
        elseif ($action === 'user')  getCurrentUser();
        else sendResponse(array('error' => 'Invalid action'), 400);
        break;
    default:
        sendResponse(array('error' => 'Method not allowed'), 405);
}

function registerUser() {
    $data = getRequestBody();
    if (empty($data['username']) || empty($data['email']) || empty($data['password']))
        sendResponse(array('error' => 'Username, email, and password are required'), 400);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
        sendResponse(array('error' => 'Invalid email format'), 400);
    if (strlen($data['password']) < 8)
        sendResponse(array('error' => 'Password must be at least 8 characters'), 400);

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $stmt->execute(array($data['username'], $data['email']));
    if ($stmt->fetch()) sendResponse(array('error' => 'Username or email already exists'), 409);

    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute(array($data['username'], $data['email'], $hash));
    $userId = $db->lastInsertId();

    $token = createJWT(array('user_id' => $userId, 'username' => $data['username'], 'email' => $data['email']));
    sendResponse(array(
        'message' => 'Registration successful',
        'token'   => $token,
        'user'    => array('user_id' => $userId, 'username' => $data['username'], 'email' => $data['email'], 'roles' => array('user'))
    ), 201);
}

function loginUser() {
    $data = getRequestBody();
    if (empty($data['email']) || empty($data['password']))
        sendResponse(array('error' => 'Email and password are required'), 400);

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT user_id, username, email, password_hash FROM users WHERE email = ?");
    $stmt->execute(array($data['email']));
    $user = $stmt->fetch();
    if (!$user || !password_verify($data['password'], $user['password_hash']))
        sendResponse(array('error' => 'Invalid email or password'), 401);

    $token = createJWT(array('user_id' => $user['user_id'], 'username' => $user['username'], 'email' => $user['email']));
    sendResponse(array(
        'message' => 'Login successful',
        'token'   => $token,
        'user'    => array('user_id' => $user['user_id'], 'username' => $user['username'], 'email' => $user['email'], 'roles' => array('user'))
    ));
}

function checkToken() {
    $token = getAuthToken();
    if (!$token) { sendResponse(array('authenticated' => false)); }
    $payload = verifyJWT($token);
    if (!$payload) { sendResponse(array('authenticated' => false)); }
    sendResponse(array(
        'authenticated' => true,
        'user' => array('user_id' => $payload['user_id'], 'username' => $payload['username'], 'email' => $payload['email'], 'roles' => array('user'))
    ));
}

function getCurrentUser() {
    $token = getAuthToken();
    if (!$token) sendResponse(array('error' => 'Not authenticated'), 401);
    $payload = verifyJWT($token);
    if (!$payload) sendResponse(array('error' => 'Invalid or expired token'), 401);

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT user_id, username, email, created_at FROM users WHERE user_id = ?");
    $stmt->execute(array($payload['user_id']));
    $user = $stmt->fetch();
    if (!$user) sendResponse(array('error' => 'User not found'), 404);

    $buildStmt = $db->prepare("SELECT COUNT(*) as count FROM pc_builds WHERE user_id = ?");
    $buildStmt->execute(array($user['user_id']));
    $buildCount = $buildStmt->fetch();

    sendResponse(array('user' => array_merge($user, array('roles' => array('user'), 'build_count' => (int)$buildCount['count']))));
}