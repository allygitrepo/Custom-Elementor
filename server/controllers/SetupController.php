<?php
/**
 * LightBuilder - Setup Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Database\Schema;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use Exception;

class SetupController {
    public function getStatus(array $params = [], ?array $body = null): void {
        $isInstalled = Database::isInstalled();

        // System checks
        $phpVersion = PHP_VERSION;
        $phpOk = version_compare($phpVersion, '8.1.0', '>=');
        $sqliteOk = extension_loaded('pdo_sqlite') && extension_loaded('sqlite3');
        $storageWritable = is_writable(STORAGE_PATH);
        $uploadsWritable = is_writable(UPLOADS_PATH);

        $systemRequirements = [
            'php' => [
                'name' => 'PHP Version (>= 8.1)',
                'current' => $phpVersion,
                'status' => $phpOk
            ],
            'sqlite' => [
                'name' => 'SQLite & PDO Extension',
                'status' => $sqliteOk
            ],
            'storage_writable' => [
                'name' => 'Storage Directory Writable',
                'path' => STORAGE_PATH,
                'status' => $storageWritable
            ],
            'uploads_writable' => [
                'name' => 'Uploads Directory Writable',
                'path' => UPLOADS_PATH,
                'status' => $uploadsWritable
            ]
        ];

        $allRequirementsMet = $phpOk && $sqliteOk && $storageWritable && $uploadsWritable;

        Response::json([
            'is_installed' => $isInstalled,
            'requirements' => $systemRequirements,
            'can_install' => $allRequirementsMet,
            'version' => LIGHTBUILDER_VERSION
        ]);
    }

    public function install(array $params = [], ?array $body = null): void {
        if (Database::isInstalled()) {
            Response::error('LightBuilder is already installed.', 400);
        }

        $name = trim($body['name'] ?? '');
        $email = trim(filter_var($body['email'] ?? '', FILTER_SANITIZE_EMAIL));
        $password = $body['password'] ?? '';
        $confirmPassword = $body['confirm_password'] ?? '';
        $siteName = trim($body['site_name'] ?? 'My LightBuilder Site');

        if (empty($name)) {
            Response::error('Administrator name is required.');
        }

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid administrator email is required.');
        }

        if (strlen($password) < 6) {
            Response::error('Password must be at least 6 characters long.');
        }

        if ($password !== $confirmPassword) {
            Response::error('Passwords do not match.');
        }

        try {
            $db = Database::getConnection();
            
            // Create database schema tables
            Schema::createTables($db);

            // Create admin user
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'active')");
            $stmt->execute([$name, $email, $passwordHash]);
            $userId = (int)$db->lastInsertId();

            // Set site settings
            $settingStmt = $db->prepare("UPDATE settings SET value = ? WHERE key = 'site_name'");
            $settingStmt->execute([$siteName]);

            // Create a sample demo website
            $webStmt = $db->prepare("INSERT INTO websites (user_id, name, slug, status, settings_json) VALUES (?, ?, ?, 'active', ?)");
            $demoSettings = json_encode(['title' => $siteName, 'theme' => 'light']);
            $webStmt->execute([$userId, 'My First Website', 'my-first-website', $demoSettings]);
            $websiteId = (int)$db->lastInsertId();

            // Create demo Home page
            $initialContent = json_encode([
                'id' => 'root',
                'type' => 'container',
                'settings' => [
                    'direction' => 'column',
                    'align' => 'center',
                    'justify' => 'center',
                    'padding' => ['top' => '80px', 'right' => '24px', 'bottom' => '80px', 'left' => '24px'],
                    'background' => '#f8fafc',
                    'minHeight' => '60vh'
                ],
                'children' => [
                    [
                        'id' => 'hero_heading_' . uniqid(),
                        'type' => 'heading',
                        'settings' => [
                            'text' => 'Welcome to LightBuilder',
                            'tag' => 'h1',
                            'align' => 'center',
                            'color' => '#0f172a',
                            'fontSize' => ['desktop' => '48px', 'tablet' => '36px', 'mobile' => '28px'],
                            'fontWeight' => '700'
                        ],
                        'children' => []
                    ],
                    [
                        'id' => 'hero_text_' . uniqid(),
                        'type' => 'text',
                        'settings' => [
                            'text' => '<p>Craft high-performing, lightweight websites visually with instant live preview and zero bloat.</p>',
                            'align' => 'center',
                            'color' => '#475569',
                            'fontSize' => ['desktop' => '18px', 'tablet' => '16px', 'mobile' => '15px'],
                            'maxWidth' => '640px'
                        ],
                        'children' => []
                    ],
                    [
                        'id' => 'hero_btn_' . uniqid(),
                        'type' => 'button',
                        'settings' => [
                            'text' => 'Start Designing',
                            'url' => '#',
                            'background' => '#3b82f6',
                            'textColor' => '#ffffff',
                            'borderRadius' => '8px',
                            'padding' => ['top' => '12px', 'right' => '28px', 'bottom' => '12px', 'left' => '28px'],
                            'fontWeight' => '600'
                        ],
                        'children' => []
                    ]
                ]
            ]);

            $pageStmt = $db->prepare("INSERT INTO pages (website_id, title, slug, status, content_json) VALUES (?, 'Home', 'home', 'active', ?)");
            $pageStmt->execute([$websiteId, $initialContent]);

            // Set session
            AuthMiddleware::initSession();
            $_SESSION['user_id'] = $userId;

            $user = [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => 'admin',
                'status' => 'active'
            ];
            $token = AuthMiddleware::generateToken(['id' => $userId, 'password_hash' => $passwordHash]);

            Response::success([
                'user' => $user,
                'token' => $token
            ], 'Installation completed successfully!');
        } catch (Exception $e) {
            Response::error('Installation failed: ' . $e->getMessage(), 500);
        }
    }
}
