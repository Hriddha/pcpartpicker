<?php
/**
 * Authentication API for PC Part Picker
 * Handles user registration, login, logout, and session management
 */

require_once 'config.php';

// Start session for authentication
session_start();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'POST':
        if ($action === 'register') {
            registerUser();
        } elseif ($action === 'login') {
            loginUser();
        } elseif ($action === 'logout') {
            logoutUser();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'GET':
        if ($action === 'check') {
            checkSession();
        } elseif ($action === 'user') {
            getCurrentUser();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Register a new user
 */
function registerUser() {
    $data = getRequestBody();
    
    // Validate required fields
    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        sendResponse(['error' => 'Username, email, and password are required'], 400);
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendResponse(['error' => 'Invalid email format'], 400);
    }
    
    // Validate password strength (min 8 characters)
    if (strlen($data['password']) < 8) {
        sendResponse(['error' => 'Password must be at least 8 characters'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Check if username or email already exists
    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$data['username'], $data['email']]);
    
    if ($stmt->fetch()) {
        sendResponse(['error' => 'Username or email already exists'], 409);
    }
    
    // Hash password using bcrypt
    $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
    
    // Insert new user
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$data['username'], $data['email'], $passwordHash]);
    
    $userId = $db->lastInsertId();
    
    // Assign default role (if roles table has entries)
    $roleStmt = $db->prepare("SELECT role_id FROM roles WHERE role_name = 'user' LIMIT 1");
    $roleStmt->execute();
    $role = $roleStmt->fetch();
    
    if ($role) {
        $roleAssignStmt = $db->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
        $roleAssignStmt->execute([$userId, $role['role_id']]);
    }
    
    // Start session for new user
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $data['username'];
    $_SESSION['email'] = $data['email'];
    
    sendResponse([
        'message' => 'Registration successful',
        'user' => [
            'user_id' => $userId,
            'username' => $data['username'],
            'email' => $data['email']
        ]
    ], 201);
}

/**
 * Login user
 */
function loginUser() {
    $data = getRequestBody();
    
    // Validate required fields
    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(['error' => 'Email and password are required'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Find user by email
    $stmt = $db->prepare("SELECT user_id, username, email, password_hash FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendResponse(['error' => 'Invalid email or password'], 401);
    }
    
    // Verify password
    if (!password_verify($data['password'], $user['password_hash'])) {
        sendResponse(['error' => 'Invalid email or password'], 401);
    }
    
    // Get user roles
    $roleStmt = $db->prepare("
        SELECT r.role_name 
        FROM roles r 
        JOIN user_roles ur ON r.role_id = ur.role_id 
        WHERE ur.user_id = ?
    ");
    $roleStmt->execute([$user['user_id']]);
    $roles = $roleStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Start session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['roles'] = $roles;
    
    sendResponse([
        'message' => 'Login successful',
        'user' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'roles' => $roles
        ]
    ]);
}

/**
 * Logout user
 */
function logoutUser() {
    session_destroy();
    sendResponse(['message' => 'Logout successful']);
}

/**
 * Check if user is logged in
 */
function checkSession() {
    if (isset($_SESSION['user_id'])) {
        sendResponse([
            'authenticated' => true,
            'user' => [
                'user_id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'email' => $_SESSION['email'],
                'roles' => $_SESSION['roles'] ?? []
            ]
        ]);
    } else {
        sendResponse(['authenticated' => false]);
    }
}

/**
 * Get current user details
 */
function getCurrentUser() {
    if (!isset($_SESSION['user_id'])) {
        sendResponse(['error' => 'Not authenticated'], 401);
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("SELECT user_id, username, email, created_at, updated_at FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        session_destroy();
        sendResponse(['error' => 'User not found'], 404);
    }
    
    // Get user roles
    $roleStmt = $db->prepare("
        SELECT r.role_name 
        FROM roles r 
        JOIN user_roles ur ON r.role_id = ur.role_id 
        WHERE ur.user_id = ?
    ");
    $roleStmt->execute([$user['user_id']]);
    $roles = $roleStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Get build count
    $buildStmt = $db->prepare("SELECT COUNT(*) as count FROM pc_builds WHERE user_id = ?");
    $buildStmt->execute([$user['user_id']]);
    $buildCount = $buildStmt->fetch()['count'];
    
    sendResponse([
        'user' => array_merge($user, [
            'roles' => $roles,
            'build_count' => $buildCount
        ])
    ]);
}
