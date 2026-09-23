<?php
/**
 * LightBuilder - Publish & Preview Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use LightBuilder\Renderer\HtmlCompiler;
use Exception;

class PublishController {
    /**
     * Helper to compile and publish ALL pages belonging to a website
     */
    public static function publishAllPagesForWebsite(int $websiteId, \PDO $db): array {
        // Fetch website
        $webStmt = $db->prepare("SELECT * FROM websites WHERE id = ?");
        $webStmt->execute([$websiteId]);
        $website = $webStmt->fetch();

        if (!$website) {
            throw new Exception("Website with ID {$websiteId} not found");
        }

        // Fetch ALL pages for this website
        $pageStmt = $db->prepare("SELECT id, website_id, title, slug, status, content_json, styles_css, settings_json FROM pages WHERE website_id = ? ORDER BY id ASC");
        $pageStmt->execute([$websiteId]);
        $allPages = $pageStmt->fetchAll();

        if (empty($allPages)) {
            throw new Exception("This website has no pages to publish.");
        }

        $websiteData = [
            'name' => $website['name'],
            'slug' => $website['slug'],
            'pages' => $allPages
        ];

        $targetDir = PUBLISHED_PATH . '/' . $website['slug'];
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }

        // Copy / mirror uploaded assets into published website's uploads folder
        $pubUploadsDir = $targetDir . '/uploads';
        if (!is_dir($pubUploadsDir)) {
            @mkdir($pubUploadsDir, 0755, true);
        }
        if (is_dir(UPLOADS_PATH)) {
            $uploadedFiles = glob(UPLOADS_PATH . '/*');
            if ($uploadedFiles) {
                foreach ($uploadedFiles as $uFile) {
                    if (is_file($uFile)) {
                        @copy($uFile, $pubUploadsDir . '/' . basename($uFile));
                    }
                }
            }
        }

        $compiler = new HtmlCompiler();
        $publishedFiles = [];
        $publishedPagesInfo = [];

        // Compile each page with navigation aware of ALL pages
        foreach ($allPages as $p) {
            $compiledHtml = $compiler->compilePage($p, $websiteData);
            
            $pSlug = trim($p['slug'] ?? 'home', '/');
            if (empty($pSlug)) {
                $pSlug = 'home';
            }
            $filename = ($pSlug === 'home' || $pSlug === 'index') ? 'index.html' : ($pSlug . '.html');
            
            file_put_contents($targetDir . '/' . $filename, $compiledHtml);
            $publishedFiles[] = $filename;

            // Mark page as published
            $db->prepare("UPDATE pages SET status = 'published', published_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$p['id']]);

            $publishedPagesInfo[] = [
                'id' => $p['id'],
                'title' => $p['title'],
                'slug' => $p['slug'],
                'filename' => $filename
            ];
        }

        // Prune any stale HTML files in target directory that no longer match active pages
        if (is_dir($targetDir)) {
            $existingFiles = glob($targetDir . '/*.html');
            foreach ($existingFiles as $f) {
                $base = basename($f);
                if (!in_array($base, $publishedFiles, true)) {
                    @unlink($f);
                }
            }
        }

        // Mark website as published
        $db->prepare("UPDATE websites SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$websiteId]);

        // Build clean base URL
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        $protocol = $isHttps ? "https://" : "http://";
        $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
        if ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.') {
            $scriptDir = '';
        }
        $basePath = rtrim($protocol . $host . $scriptDir, '/');
        $siteUrl = $basePath . '/published/' . $website['slug'] . '/index.html';

        return [
            'website_id' => $websiteId,
            'website_name' => $website['name'],
            'website_slug' => $website['slug'],
            'published_url' => $siteUrl,
            'target_dir' => $targetDir,
            'pages_count' => count($allPages),
            'pages' => $publishedPagesInfo
        ];
    }

    public function publishPage(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $query = "SELECT p.*, w.name as website_name, w.slug as website_slug 
                      FROM pages p 
                      JOIN websites w ON p.website_id = w.id 
                      WHERE p.id = ? AND w.user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$id, $user['id']]);
            $page = $stmt->fetch();

            if (!$page) {
                Response::notFound('Page not found');
            }

            // Synchronize and publish ALL pages under this website
            $result = self::publishAllPagesForWebsite((int)$page['website_id'], $db);

            $pSlug = trim($page['slug'] ?? 'home', '/');
            $pFilename = ($pSlug === 'home' || $pSlug === 'index') ? 'index.html' : ($pSlug . '.html');
            
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
            $protocol = $isHttps ? "https://" : "http://";
            $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
            $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
            if ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.') {
                $scriptDir = '';
            }
            $basePath = rtrim($protocol . $host . $scriptDir, '/');
            $pageUrl = $basePath . '/published/' . $page['website_slug'] . '/' . $pFilename;

            $result['current_page_id'] = $id;
            $result['current_page_url'] = $pageUrl;

            Response::success($result, 'Page and all website pages published successfully!');
        } catch (Exception $e) {
            Response::error('Failed to publish: ' . $e->getMessage(), 500);
        }
    }

    public function publishWebsite(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $websiteId = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM websites WHERE id = ? AND user_id = ?");
            $stmt->execute([$websiteId, $user['id']]);
            $website = $stmt->fetch();

            if (!$website) {
                Response::notFound('Website not found');
            }

            $result = self::publishAllPagesForWebsite($websiteId, $db);

            Response::success($result, 'All website pages published successfully!');
        } catch (Exception $e) {
            Response::error('Failed to publish website: ' . $e->getMessage(), 500);
        }
    }

    public function servePublished(array $params = [], ?array $body = null): void {
        $slug = preg_replace('/[^a-zA-Z0-9_-]/', '', $params['slug'] ?? '');
        $file = $params['file'] ?? 'index.html';

        // Handle media uploads inside published folder or direct assets
        $cleanFile = ltrim(str_replace('\\', '/', $file), '/');
        if (str_starts_with($cleanFile, 'uploads/') || !empty($params['upload_file'])) {
            $assetFilename = basename($params['upload_file'] ?? $cleanFile);
            $assetPath = PUBLISHED_PATH . '/' . $slug . '/uploads/' . $assetFilename;
            if (!file_exists($assetPath)) {
                $assetPath = UPLOADS_PATH . '/' . $assetFilename;
            }
            if (file_exists($assetPath)) {
                $ext = strtolower(pathinfo($assetPath, PATHINFO_EXTENSION));
                $mimes = [
                    'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
                    'gif' => 'image/gif', 'webp' => 'image/webp', 'svg' => 'image/svg+xml',
                    'ico' => 'image/x-icon', 'bmp' => 'image/bmp', 'avif' => 'image/avif',
                    'mp4' => 'video/mp4', 'webm' => 'video/webm', 'ogg' => 'video/ogg',
                    'mp3' => 'audio/mpeg', 'wav' => 'audio/wav', 'pdf' => 'application/pdf',
                    'css' => 'text/css', 'js' => 'application/javascript'
                ];
                $mime = $mimes[$ext] ?? 'application/octet-stream';
                header("Content-Type: {$mime}");
                header('Cache-Control: public, max-age=31536000');
                readfile($assetPath);
                exit;
            }
        }

        $file = preg_replace('/[^a-zA-Z0-9_.-]/', '', $file);

        if (empty($file) || $file === 'index') {
            $file = 'index.html';
        }

        if (!str_ends_with($file, '.html') && !str_ends_with($file, '.css') && !str_ends_with($file, '.js')) {
            $file .= '.html';
        }

        $targetPath = PUBLISHED_PATH . '/' . $slug . '/' . $file;

        if (!file_exists($targetPath)) {
            http_response_code(404);
            header('Content-Type: text/html; charset=utf-8');
            echo "<!DOCTYPE html><html><head><title>404 Not Found</title><style>body{font-family:sans-serif;background:#0b0f17;color:#fff;padding:40px;text-align:center;}a{color:#38bdf8;}</style></head><body><h1>404 - Page Not Found</h1><p>The page <code>{$slug}/{$file}</code> does not exist or has not been published yet.</p><p><a href=\"index.html\">Back to Home</a></p></body></html>";
            exit;
        }

        $mime = 'text/html';
        if (str_ends_with($file, '.css')) $mime = 'text/css';
        if (str_ends_with($file, '.js')) $mime = 'application/javascript';

        header("Content-Type: {$mime}; charset=utf-8");
        readfile($targetPath);
        exit;
    }

    public function previewPage(array $params = [], ?array $body = null): void {
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $query = "SELECT p.*, w.name as website_name, w.slug as website_slug 
                      FROM pages p 
                      JOIN websites w ON p.website_id = w.id 
                      WHERE p.id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$id]);
            $page = $stmt->fetch();

            if (!$page) {
                http_response_code(404);
                echo 'Page not found';
                exit;
            }

            // Get all website pages
            $pagesStmt = $db->prepare("SELECT id, title, slug, status FROM pages WHERE website_id = ? ORDER BY id ASC");
            $pagesStmt->execute([$page['website_id']]);
            $allPages = $pagesStmt->fetchAll();

            $website = [
                'name' => $page['website_name'],
                'slug' => $page['website_slug'],
                'pages' => $allPages
            ];

            $compiler = new HtmlCompiler();
            $compiledHtml = $compiler->compilePage($page, $website);

            header('Content-Type: text/html; charset=utf-8');
            echo $compiledHtml;
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo 'Preview error: ' . $e->getMessage();
            exit;
        }
    }
}

