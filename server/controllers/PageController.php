<?php
/**
 * LightBuilder - Page Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use Exception;

class PageController {
    public function indexByWebsite(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $websiteId = (int)($params['website_id'] ?? 0);

        try {
            $db = Database::getConnection();
            // Verify website ownership
            $webStmt = $db->prepare("SELECT id FROM websites WHERE id = ? AND user_id = ?");
            $webStmt->execute([$websiteId, $user['id']]);
            if (!$webStmt->fetch()) {
                Response::notFound('Website not found');
            }

            $stmt = $db->prepare("SELECT id, website_id, title, slug, status, created_at, updated_at, published_at FROM pages WHERE website_id = ? ORDER BY id ASC");
            $stmt->execute([$websiteId]);
            $pages = $stmt->fetchAll();

            Response::json($pages);
        } catch (Exception $e) {
            Response::error('Failed to fetch pages: ' . $e->getMessage(), 500);
        }
    }

    public function create(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $websiteId = (int)($params['website_id'] ?? ($body['website_id'] ?? 0));

        $title = trim($body['title'] ?? '');
        $slug = trim($body['slug'] ?? '');

        if (empty($title)) {
            Response::error('Page title is required.');
        }

        if (empty($slug)) {
            $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $title));
            $slug = trim($slug, '-');
        }

        try {
            $db = Database::getConnection();
            $webStmt = $db->prepare("SELECT id FROM websites WHERE id = ? AND user_id = ?");
            $webStmt->execute([$websiteId, $user['id']]);
            if (!$webStmt->fetch()) {
                Response::notFound('Website not found');
            }

            // Check slug uniqueness within website
            $check = $db->prepare("SELECT id FROM pages WHERE website_id = ? AND slug = ?");
            $check->execute([$websiteId, $slug]);
            if ($check->fetch()) {
                $slug .= '-' . time();
            }

            $initialContent = json_encode([
                'id' => 'root',
                'type' => 'container',
                'settings' => [
                    'direction' => 'column',
                    'align' => 'center',
                    'justify' => 'center',
                    'padding' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                    'margin' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                    'gap' => '0px',
                    'background' => '#070a0f',
                    'minHeight' => '100vh'
                ],
                'children' => [
                    [
                        'id' => 'heading_' . uniqid(),
                        'type' => 'heading',
                        'settings' => [
                            'text' => $title,
                            'tag' => 'h1',
                            'align' => 'center',
                            'color' => '#ffffff',
                            'fontSize' => ['desktop' => '40px', 'tablet' => '32px', 'mobile' => '26px'],
                            'fontWeight' => '800'
                        ],
                        'children' => []
                    ]
                ]
            ]);

            $stmt = $db->prepare("INSERT INTO pages (website_id, title, slug, status, content_json, styles_css, settings_json) VALUES (?, ?, ?, 'active', ?, '', '{}')");
            $stmt->execute([$websiteId, $title, $slug, $initialContent]);
            $pageId = (int)$db->lastInsertId();

            $fetch = $db->prepare("SELECT * FROM pages WHERE id = ?");
            $fetch->execute([$pageId]);
            $page = $fetch->fetch();

            // If website is already published, synchronize static files
            $webCheck = $db->prepare("SELECT status FROM websites WHERE id = ?");
            $webCheck->execute([$websiteId]);
            $webRow = $webCheck->fetch();
            if ($webRow && $webRow['status'] === 'published') {
                try {
                    PublishController::publishAllPagesForWebsite($websiteId, $db);
                } catch (\Exception $ignored) {}
            }

            Response::success($page, 'Page created successfully', 201);
        } catch (Exception $e) {
            Response::error('Failed to create page: ' . $e->getMessage(), 500);
        }
    }

    public function show(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $query = "SELECT p.*, w.name as website_name, w.slug as website_slug, w.domain as website_domain 
                      FROM pages p 
                      JOIN websites w ON p.website_id = w.id 
                      WHERE p.id = ? AND w.user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$id, $user['id']]);
            $page = $stmt->fetch();

            if (!$page) {
                Response::notFound('Page not found');
            }

            // Decode content_json if valid JSON
            $page['content'] = json_decode($page['content_json'] ?: '{}', true);
            $page['settings'] = json_decode($page['settings_json'] ?: '{}', true);

            Response::json($page);
        } catch (Exception $e) {
            Response::error('Failed to fetch page: ' . $e->getMessage(), 500);
        }
    }

    public function update(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $query = "SELECT p.* FROM pages p JOIN websites w ON p.website_id = w.id WHERE p.id = ? AND w.user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$id, $user['id']]);
            $page = $stmt->fetch();

            if (!$page) {
                Response::notFound('Page not found');
            }

            $title = trim($body['title'] ?? $page['title']);
            $slug = trim($body['slug'] ?? $page['slug']);
            $status = $body['status'] ?? $page['status'];
            $settingsJson = isset($body['settings']) ? json_encode($body['settings']) : $page['settings_json'];

            if (!empty($slug) && $slug !== $page['slug']) {
                $check = $db->prepare("SELECT id FROM pages WHERE website_id = ? AND slug = ? AND id != ?");
                $check->execute([$page['website_id'], $slug, $id]);
                if ($check->fetch()) {
                    Response::error('Page URL slug already exists in this website.');
                }
            }

            $update = $db->prepare("UPDATE pages SET title = ?, slug = ?, status = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $update->execute([$title, $slug, $status, $settingsJson, $id]);

            // If website is already published, synchronize static files
            $webCheck = $db->prepare("SELECT status FROM websites WHERE id = ?");
            $webCheck->execute([$page['website_id']]);
            $webRow = $webCheck->fetch();
            if ($webRow && $webRow['status'] === 'published') {
                try {
                    PublishController::publishAllPagesForWebsite((int)$page['website_id'], $db);
                } catch (\Exception $ignored) {}
            }

            $stmt->execute([$id, $user['id']]);
            $updated = $stmt->fetch();

            Response::success($updated, 'Page updated successfully');
        } catch (Exception $e) {
            Response::error('Failed to update page: ' . $e->getMessage(), 500);
        }
    }

    public function save(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $query = "SELECT p.* FROM pages p JOIN websites w ON p.website_id = w.id WHERE p.id = ? AND w.user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$id, $user['id']]);
            $page = $stmt->fetch();

            if (!$page) {
                Response::notFound('Page not found');
            }

            $contentJson = isset($body['content']) ? (is_string($body['content']) ? $body['content'] : json_encode($body['content'])) : $page['content_json'];
            $stylesCss = $body['styles_css'] ?? $page['styles_css'];
            $settingsJson = isset($body['settings']) ? (is_string($body['settings']) ? $body['settings'] : json_encode($body['settings'])) : $page['settings_json'];

            $update = $db->prepare("UPDATE pages SET content_json = ?, styles_css = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $update->execute([$contentJson, $stylesCss, $settingsJson, $id]);

            // Update website's updated_at as well
            $db->prepare("UPDATE websites SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$page['website_id']]);

            Response::success([
                'id' => $id,
                'updated_at' => date('Y-m-d H:i:s')
            ], 'Page saved successfully');
        } catch (Exception $e) {
            Response::error('Failed to save page: ' . $e->getMessage(), 500);
        }
    }

    public function duplicate(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $query = "SELECT p.* FROM pages p JOIN websites w ON p.website_id = w.id WHERE p.id = ? AND w.user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$id, $user['id']]);
            $page = $stmt->fetch();

            if (!$page) {
                Response::notFound('Page not found');
            }

            $newTitle = $page['title'] . ' (Copy)';
            $newSlug = $page['slug'] . '-copy-' . time();

            $insert = $db->prepare("INSERT INTO pages (website_id, title, slug, status, content_json, styles_css, settings_json) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $insert->execute([
                $page['website_id'],
                $newTitle,
                $newSlug,
                $page['status'],
                $page['content_json'],
                $page['styles_css'],
                $page['settings_json']
            ]);
            $newPageId = (int)$db->lastInsertId();

            $fetchNew = $db->prepare("SELECT * FROM pages WHERE id = ?");
            $fetchNew->execute([$newPageId]);
            $duplicated = $fetchNew->fetch();

            // If website is already published, synchronize static files
            $webCheck = $db->prepare("SELECT status FROM websites WHERE id = ?");
            $webCheck->execute([$page['website_id']]);
            $webRow = $webCheck->fetch();
            if ($webRow && $webRow['status'] === 'published') {
                try {
                    PublishController::publishAllPagesForWebsite((int)$page['website_id'], $db);
                } catch (\Exception $ignored) {}
            }

            Response::success($duplicated, 'Page duplicated successfully');
        } catch (Exception $e) {
            Response::error('Failed to duplicate page: ' . $e->getMessage(), 500);
        }
    }

    public function delete(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $query = "SELECT p.* FROM pages p JOIN websites w ON p.website_id = w.id WHERE p.id = ? AND w.user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$id, $user['id']]);
            $page = $stmt->fetch();

            if (!$page) {
                Response::notFound('Page not found');
            }

            // Check if it's the only page in the website
            $countStmt = $db->prepare("SELECT COUNT(*) as count FROM pages WHERE website_id = ?");
            $countStmt->execute([$page['website_id']]);
            $count = (int)$countStmt->fetch()['count'];

            if ($count <= 1) {
                Response::error('Cannot delete the only page in the website. Create another page first.');
            }

            $del = $db->prepare("DELETE FROM pages WHERE id = ?");
            $del->execute([$id]);

            // If website is already published, synchronize static files
            $webCheck = $db->prepare("SELECT status FROM websites WHERE id = ?");
            $webCheck->execute([$page['website_id']]);
            $webRow = $webCheck->fetch();
            if ($webRow && $webRow['status'] === 'published') {
                try {
                    PublishController::publishAllPagesForWebsite((int)$page['website_id'], $db);
                } catch (\Exception $ignored) {}
            }

            Response::success(null, 'Page deleted successfully');
        } catch (Exception $e) {
            Response::error('Failed to delete page: ' . $e->getMessage(), 500);
        }
    }
}
