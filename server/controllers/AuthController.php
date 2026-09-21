<?php
/**
 * LightBuilder - Authentication Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use Exception;

class AuthController {
    public function login(array $params = [], ?array $body = null): void {
        $email = trim(filter_var($body['email'] ?? '', FILTER_SANITIZE_EMAIL));
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required.');
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND status = 'active'");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                Response::error('Invalid email or password.', 401);
            }

            AuthMiddleware::initSession();
            $_SESSION['user_id'] = $user['id'];

            $token = AuthMiddleware::generateToken($user);
            unset($user['password_hash']);

            Response::success([
                'user' => $user,
                'token' => $token
            ], 'Login successful');
        } catch (Exception $e) {
            Response::error('Login failed: ' . $e->getMessage(), 500);
        }
    }

    public function logout(array $params = [], ?array $body = null): void {
        AuthMiddleware::initSession();
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $paramsCookie = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $paramsCookie["path"], $paramsCookie["domain"],
                $paramsCookie["secure"], $paramsCookie["httponly"]
            );
        }
        session_destroy();

        Response::success(null, 'Logged out successfully');
    }

    public function me(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        Response::json(['user' => $user]);
    }

    public function updateProfile(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $name = trim($body['name'] ?? '');
        $email = trim(filter_var($body['email'] ?? '', FILTER_SANITIZE_EMAIL));
        $currentPassword = $body['current_password'] ?? '';
        $newPassword = $body['new_password'] ?? '';

        if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Valid name and email are required.');
        }

        try {
            $db = Database::getConnection();

            // Check if email taken by another user
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([$email, $user['id']]);
            if ($stmt->fetch()) {
                Response::error('Email address is already taken by another account.');
            }

            if (!empty($newPassword)) {
                if (strlen($newPassword) < 6) {
                    Response::error('New password must be at least 6 characters.');
                }
                // Verify current password
                $userStmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
                $userStmt->execute([$user['id']]);
                $fullUser = $userStmt->fetch();
                if (!$fullUser || !password_verify($currentPassword, $fullUser['password_hash'])) {
                    Response::error('Current password is incorrect.');
                }

                $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
                $update = $db->prepare("UPDATE users SET name = ?, email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                $update->execute([$name, $email, $newHash, $user['id']]);
            } else {
                $update = $db->prepare("UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                $update->execute([$name, $email, $user['id']]);
            }

            $user['name'] = $name;
            $user['email'] = $email;

            Response::success(['user' => $user], 'Profile updated successfully');
        } catch (Exception $e) {
            Response::error('Failed to update profile: ' . $e->getMessage(), 500);
        }
    }
}
