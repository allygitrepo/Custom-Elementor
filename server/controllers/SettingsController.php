<?php
/**
 * LightBuilder - Settings Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use Exception;

class SettingsController {
    public function index(array $params = [], ?array $body = null): void {
        AuthMiddleware::requireAuth();

        try {
            $db = Database::getConnection();
            $stmt = $db->query("SELECT key, value FROM settings");
            $rows = $stmt->fetchAll();

            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['key']] = $row['value'];
            }

            Response::json($settings);
        } catch (Exception $e) {
            Response::error('Failed to fetch settings: ' . $e->getMessage(), 500);
        }
    }

    public function update(array $params = [], ?array $body = null): void {
        AuthMiddleware::requireAdmin();

        if (empty($body) || !is_array($body)) {
            Response::error('Invalid settings payload.');
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");

            foreach ($body as $key => $value) {
                $valStr = is_array($value) ? json_encode($value) : (string)$value;
                $stmt->execute([$key, $valStr]);
            }

            Response::success(null, 'Settings updated successfully');
        } catch (Exception $e) {
            Response::error('Failed to update settings: ' . $e->getMessage(), 500);
        }
    }
}
