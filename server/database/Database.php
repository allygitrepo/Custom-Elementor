<?php
/**
 * LightBuilder - Database Connection Manager (PDO SQLite)
 */

namespace LightBuilder\Database;

use PDO;
use PDOException;
use Exception;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dbPath = DATABASE_PATH;
            $dbDir = dirname($dbPath);

            if (!is_dir($dbDir)) {
                @mkdir($dbDir, 0755, true);
            }

            try {
                self::$instance = new PDO("sqlite:" . $dbPath);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                // Enable foreign keys and WAL mode for better SQLite concurrency & performance
                self::$instance->exec("PRAGMA foreign_keys = ON;");
                self::$instance->exec("PRAGMA journal_mode = WAL;");
            } catch (PDOException $e) {
                throw new Exception("Database connection failed: " . $e->getMessage());
            }
        }

        return self::$instance;
    }

    public static function isInstalled(): bool {
        if (!file_exists(DATABASE_PATH)) {
            return false;
        }

        try {
            $db = self::getConnection();
            $stmt = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
            $table = $stmt->fetch();
            if (!$table) {
                return false;
            }

            // Check if there is at least one admin user
            $countStmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role='admin'");
            $row = $countStmt->fetch();
            return (int)($row['count'] ?? 0) > 0;
        } catch (Exception $e) {
            return false;
        }
    }
}
