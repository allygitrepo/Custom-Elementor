<?php
/**
 * LightBuilder - Authentication Middleware & Session Helper
 */

namespace LightBuilder\Middleware;

use LightBuilder\Database\Database;
use PDO;
use Exception;

class AuthMiddleware {
    public static function initSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => SESSION_LIFETIME,
                'path' => '/',
                'domain' => '',
                'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_name(SESSION_NAME);
            session_start();
        }
    }

    public static function getCurrentUser(): ?array {
        self::initSession();

        // 1. Check session
        $userId = $_SESSION['user_id'] ?? null;

        // 2. Check Authorization Header Bearer token if session not found
        if (!$userId) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
            if (empty($authHeader) && function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            }

            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = trim($matches[1]);
                $tokenParts = explode(':', base64_decode($token));
                if (count($tokenParts) === 2) {
                    $id = (int)$tokenParts[0];
                    $hash = $tokenParts[1];
                    try {
                        $db = Database::getConnection();
                        $stmt = $db->prepare("SELECT * FROM users WHERE id = ? AND status = 'active'");
                        $stmt->execute([$id]);
                        $user = $stmt->fetch();
                        if ($user && hash_equals(hash('sha256', $user['password_hash'] . $user['id']), $hash)) {
                            $userId = $user['id'];
                        }
                    } catch (Exception $e) {
                        return null;
                    }
                }
            }
        }

        if (!$userId) {
            return null;
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id, name, email, role, status, created_at FROM users WHERE id = ? AND status = 'active'");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            return $user ?: null;
        } catch (Exception $e) {
            return null;
        }
    }

    public static function generateToken(array $user): string {
        $hash = hash('sha256', $user['password_hash'] . $user['id']);
        return base64_encode($user['id'] . ':' . $hash);
    }

    public static function requireAuth(): array {
        $user = self::getCurrentUser();
        if (!$user) {
            Response::unauthorized('Authentication required. Please log in.');
        }
        return $user;
    }

    public static function requireAdmin(): array {
        $user = self::requireAuth();
        if ($user['role'] !== 'admin') {
            Response::forbidden('Administrator privileges required.');
        }
        return $user;
    }
}
