<?php
/**
 * LightBuilder - Website Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use Exception;

class WebsiteController {
    public function index(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();

        try {
            $db = Database::getConnection();
            $query = "SELECT w.*, COUNT(p.id) as pages_count 
                      FROM websites w 
                      LEFT JOIN pages p ON w.id = p.website_id 
                      WHERE w.user_id = ? 
                      GROUP BY w.id 
                      ORDER BY w.updated_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute([$user['id']]);
            $websites = $stmt->fetchAll();

            Response::json($websites);
        } catch (Exception $e) {
            Response::error('Failed to fetch websites: ' . $e->getMessage(), 500);
        }
    }

    public function create(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();

        $name = trim($body['name'] ?? '');
        $slug = trim($body['slug'] ?? '');
        $domain = trim($body['domain'] ?? '');

        if (empty($name)) {
            Response::error('Website name is required.');
        }

        if (empty($slug)) {
            $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $name));
            $slug = trim($slug, '-');
        }

        try {
            $db = Database::getConnection();

            // Ensure unique slug
            $checkStmt = $db->prepare("SELECT id FROM websites WHERE slug = ?");
            $checkStmt->execute([$slug]);
            if ($checkStmt->fetch()) {
                $slug .= '-' . time();
            }

            $settingsJson = json_encode([
                'title' => $name,
                'favicon' => '',
                'custom_css' => '',
                'custom_js' => ''
            ]);

            $stmt = $db->prepare("INSERT INTO websites (user_id, name, slug, domain, status, settings_json) VALUES (?, ?, ?, ?, 'draft', ?)");
            $stmt->execute([$user['id'], $name, $slug, $domain ?: null, $settingsJson]);
            $websiteId = (int)$db->lastInsertId();

            // Create default Home page
            $initialContent = json_encode([
                'id' => 'root',
                'type' => 'container',
                'settings' => [
                    'direction' => 'column',
                    'align' => 'center',
                    'justify' => 'center',
                    'padding' => ['top' => '80px', 'right' => '24px', 'bottom' => '80px', 'left' => '24px'],
                    'background' => '#ffffff',
                    'minHeight' => '60vh'
                ],
                'children' => [
                    [
                        'id' => 'heading_' . uniqid(),
                        'type' => 'heading',
                        'settings' => [
                            'text' => $name,
                            'tag' => 'h1',
                            'align' => 'center',
                            'color' => '#0f172a',
                            'fontSize' => ['desktop' => '48px', 'tablet' => '36px', 'mobile' => '28px'],
                            'fontWeight' => '700'
                        ],
                        'children' => []
                    ],
                    [
                        'id' => 'text_' . uniqid(),
                        'type' => 'text',
                        'settings' => [
                            'text' => '<p>Start creating your masterpiece with LightBuilder drag-and-drop editor.</p>',
                            'align' => 'center',
                            'color' => '#64748b',
                            'fontSize' => ['desktop' => '18px', 'tablet' => '16px', 'mobile' => '15px']
                        ],
                        'children' => []
                    ]
                ]
            ]);

            $pageStmt = $db->prepare("INSERT INTO pages (website_id, title, slug, status, content_json) VALUES (?, 'Home', 'home', 'active', ?)");
            $pageStmt->execute([$websiteId, $initialContent]);

            $fetchStmt = $db->prepare("SELECT * FROM websites WHERE id = ?");
            $fetchStmt->execute([$websiteId]);
            $website = $fetchStmt->fetch();

            Response::success($website, 'Website created successfully', 201);
        } catch (Exception $e) {
            Response::error('Failed to create website: ' . $e->getMessage(), 500);
        }
    }

    public function show(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM websites WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $user['id']]);
            $website = $stmt->fetch();

            if (!$website) {
                Response::notFound('Website not found');
            }

            // Get pages
            $pageStmt = $db->prepare("SELECT id, website_id, title, slug, status, created_at, updated_at, published_at FROM pages WHERE website_id = ? ORDER BY id ASC");
            $pageStmt->execute([$id]);
            $website['pages'] = $pageStmt->fetchAll();

            Response::json($website);
        } catch (Exception $e) {
            Response::error('Failed to fetch website: ' . $e->getMessage(), 500);
        }
    }

    public function update(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM websites WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $user['id']]);
            $website = $stmt->fetch();

            if (!$website) {
                Response::notFound('Website not found');
            }

            $name = trim($body['name'] ?? $website['name']);
            $slug = trim($body['slug'] ?? $website['slug']);
            $domain = trim($body['domain'] ?? ($website['domain'] ?? ''));
            $status = $body['status'] ?? $website['status'];
            $settingsJson = isset($body['settings']) ? json_encode($body['settings']) : $website['settings_json'];

            if (!empty($slug) && $slug !== $website['slug']) {
                $check = $db->prepare("SELECT id FROM websites WHERE slug = ? AND id != ?");
                $check->execute([$slug, $id]);
                if ($check->fetch()) {
                    Response::error('Website URL slug is already taken.');
                }
            }

            $update = $db->prepare("UPDATE websites SET name = ?, slug = ?, domain = ?, status = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $update->execute([$name, $slug, $domain ?: null, $status, $settingsJson, $id]);

            $stmt->execute([$id, $user['id']]);
            $updated = $stmt->fetch();

            Response::success($updated, 'Website updated successfully');
        } catch (Exception $e) {
            Response::error('Failed to update website: ' . $e->getMessage(), 500);
        }
    }

    public function delete(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM websites WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $user['id']]);
            $website = $stmt->fetch();

            if (!$website) {
                Response::notFound('Website not found');
            }

            $del = $db->prepare("DELETE FROM websites WHERE id = ?");
            $del->execute([$id]);

            Response::success(null, 'Website deleted successfully');
        } catch (Exception $e) {
            Response::error('Failed to delete website: ' . $e->getMessage(), 500);
        }
    }

    public function duplicate(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM websites WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $user['id']]);
            $website = $stmt->fetch();

            if (!$website) {
                Response::notFound('Website not found');
            }

            $newName = $website['name'] . ' (Copy)';
            $newSlug = $website['slug'] . '-copy-' . time();

            $insert = $db->prepare("INSERT INTO websites (user_id, name, slug, domain, status, settings_json) VALUES (?, ?, ?, ?, ?, ?)");
            $insert->execute([$user['id'], $newName, $newSlug, $website['domain'], 'draft', $website['settings_json']]);
            $newWebsiteId = (int)$db->lastInsertId();

            // Copy all pages
            $pagesStmt = $db->prepare("SELECT * FROM pages WHERE website_id = ?");
            $pagesStmt->execute([$id]);
            $pages = $pagesStmt->fetchAll();

            $insertPage = $db->prepare("INSERT INTO pages (website_id, title, slug, status, content_json, styles_css, settings_json) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($pages as $p) {
                $insertPage->execute([
                    $newWebsiteId,
                    $p['title'],
                    $p['slug'],
                    $p['status'],
                    $p['content_json'],
                    $p['styles_css'],
                    $p['settings_json']
                ]);
            }

            $fetchNew = $db->prepare("SELECT * FROM websites WHERE id = ?");
            $fetchNew->execute([$newWebsiteId]);
            $duplicated = $fetchNew->fetch();

            Response::success($duplicated, 'Website duplicated successfully');
        } catch (Exception $e) {
            Response::error('Failed to duplicate website: ' . $e->getMessage(), 500);
        }
    }
}
