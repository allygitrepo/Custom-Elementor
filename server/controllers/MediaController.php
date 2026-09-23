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

            foreach ($media as &$item) {
                // Ensure canonical format /uploads/filename.ext
                if (!filter_var($item['file_url'], FILTER_VALIDATE_URL)) {
                    $fn = basename($item['file_url'] ?: ($item['filename'] ?? ''));
                    $item['file_url'] = '/uploads/' . $fn;
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
            $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
            $postMaxSize = ini_get('post_max_size') ?: '1024M';
            if ($contentLength > 0) {
                Response::error("The uploaded file exceeds the server post_max_size limit ({$postMaxSize}). Please check PHP settings or upload a smaller file.", 413);
            }
            Response::error('No file was uploaded.', 400);
        }

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize in php.ini (' . (ini_get('upload_max_filesize') ?: '1024M') . ').',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE specified in form.',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded.',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder on server.',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.'
            ];
            $msg = $errorMessages[$file['error']] ?? ('Upload error code: ' . $file['error']);
            Response::error($msg, 400);
        }

        // Limit size to 1GB (1024MB)
        $maxSizeBytes = 1024 * 1024 * 1024;
        if ($file['size'] > $maxSizeBytes) {
            Response::error('File size exceeds maximum limit of 1GB.', 413);
        }

        $extMap = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'bmp' => 'image/bmp',
            'avif' => 'image/avif',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'ogg' => 'video/ogg',
            'ogv' => 'video/ogg',
            'mov' => 'video/quicktime',
            'm4v' => 'video/x-m4v',
            'mkv' => 'video/x-matroska',
            'avi' => 'video/x-msvideo',
            'wmv' => 'video/x-ms-wmv',
            'flv' => 'video/x-flv',
            '3gp' => 'video/3gpp',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'm4a' => 'audio/mp4',
            'aac' => 'audio/aac',
            'flac' => 'audio/flac',
            'opus' => 'audio/opus',
            'oga' => 'audio/ogg',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt' => 'text/plain',
            'csv' => 'text/csv',
            'zip' => 'application/zip',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'otf' => 'font/otf'
        ];

        $rawExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        $mime = 'application/octet-stream';
        if (!empty($file['tmp_name']) && file_exists($file['tmp_name']) && function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $detectedMime = finfo_file($finfo, $file['tmp_name']);
                if ($detectedMime) {
                    $mime = $detectedMime;
                }
                finfo_close($finfo);
            }
        }

        if (!isset($extMap[$rawExt])) {
            Response::error('Invalid file type. Supported formats: Images (JPG, PNG, GIF, WebP, SVG, AVIF, ICO), Videos (MP4, WebM, MOV, MKV, AVI, WMV, FLV, 3GP), Audio (MP3, WAV, M4A, AAC, FLAC, OPUS), Documents (PDF, DOC, DOCX, TXT, CSV, ZIP).', 400);
        }

        $ext = $rawExt;
        if (isset($extMap[$rawExt])) {
            $mime = $extMap[$rawExt];
        }

        // Ensure upload directory exists
        if (!is_dir(UPLOADS_PATH)) {
            @mkdir(UPLOADS_PATH, 0777, true);
        }

        $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
        $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $originalName);
        if (empty($sanitizedName)) {
            $sanitizedName = 'media';
        }
        $filename = $sanitizedName . '_' . uniqid() . '.' . $ext;

        $targetPath = UPLOADS_PATH . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Failed to save uploaded file to destination. Check directory write permissions.', 500);
        }

        $width = null;
        $height = null;
        if (str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml') {
            $imgInfo = @getimagesize($targetPath);
            if ($imgInfo) {
                $width = $imgInfo[0];
                $height = $imgInfo[1];
            }
        }

        $fileUrl = '/uploads/' . $filename;

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

            Response::success($media, 'File uploaded successfully', 201);
        } catch (Exception $e) {
            @unlink($targetPath);
            Response::error('Failed to save media record: ' . $e->getMessage(), 500);
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

            $targetFilePath = UPLOADS_PATH . '/' . $media['filename'];
            if (file_exists($targetFilePath)) {
                @unlink($targetFilePath);
            } elseif (!empty($media['filepath']) && file_exists($media['filepath'])) {
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
