<?php
/**
 * LightBuilder - Media Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use Exception;

class MediaController {
    public function index(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM media WHERE user_id = ? ORDER BY id DESC");
            $stmt->execute([$user['id']]);
            $media = $stmt->fetchAll();

            // Append full URL if needed
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            
            // Build base URL for uploads
            $scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '');
            $baseUrl = rtrim($protocol . $host . $scriptDir, '/');

            foreach ($media as &$item) {
                if (!filter_var($item['file_url'], FILTER_VALIDATE_URL)) {
                    $item['file_url'] = $baseUrl . '/' . ltrim($item['file_url'], '/');
                }
            }

            Response::json($media);
        } catch (Exception $e) {
            Response::error('Failed to fetch media: ' . $e->getMessage(), 500);
        }
    }

    public function upload(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();

        if (empty($_FILES['file'])) {
            Response::error('No file was uploaded.');
        }

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('File upload error code: ' . $file['error']);
        }

        // Limit size to 10MB
        if ($file['size'] > 10 * 1024 * 1024) {
            Response::error('File size exceeds maximum limit of 10MB.');
        }

        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg'
        ];

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!isset($allowedTypes[$mime])) {
            Response::error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed.');
        }

        $ext = $allowedTypes[$mime];
        $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
        $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $originalName);
        $filename = $sanitizedName . '_' . uniqid() . '.' . $ext;

        $targetPath = UPLOADS_PATH . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Failed to save uploaded file on server.', 500);
        }

        $width = null;
        $height = null;
        if ($mime !== 'image/svg+xml') {
            $imgInfo = @getimagesize($targetPath);
            if ($imgInfo) {
                $width = $imgInfo[0];
                $height = $imgInfo[1];
            }
        }

        $fileUrl = 'uploads/' . $filename;

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT INTO media (user_id, filename, original_name, filepath, file_url, file_type, file_size, width, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $user['id'],
                $filename,
                $file['name'],
                $targetPath,
                $fileUrl,
                $mime,
                $file['size'],
                $width,
                $height
            ]);
            $mediaId = (int)$db->lastInsertId();

            $fetch = $db->prepare("SELECT * FROM media WHERE id = ?");
            $fetch->execute([$mediaId]);
            $media = $fetch->fetch();

            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '');
            $baseUrl = rtrim($protocol . $host . $scriptDir, '/');
            $media['file_url'] = $baseUrl . '/' . ltrim($media['file_url'], '/');

            Response::success($media, 'File uploaded successfully', 201);
        } catch (Exception $e) {
            @unlink($targetPath);
            Response::error('Failed to save media metadata: ' . $e->getMessage(), 500);
        }
    }

    public function delete(array $params = [], ?array $body = null): void {
        $user = AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM media WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $user['id']]);
            $media = $stmt->fetch();

            if (!$media) {
                Response::notFound('Media item not found');
            }

            // Remove file from disk
            if (file_exists($media['filepath'])) {
                @unlink($media['filepath']);
            }

            $del = $db->prepare("DELETE FROM media WHERE id = ?");
            $del->execute([$id]);

            Response::success(null, 'Media item deleted successfully');
        } catch (Exception $e) {
            Response::error('Failed to delete media: ' . $e->getMessage(), 500);
        }
    }
}
