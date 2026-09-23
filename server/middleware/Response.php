<?php
/**
 * LightBuilder - Response Utility
 */

namespace LightBuilder\Middleware;

class Response {
    public static function json($data, int $statusCode = 200, string $message = ''): void {
        // Clean any buffered output to prevent stray characters or notices before JSON
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => $statusCode >= 200 && $statusCode < 300,
        ];

        if ($message !== '') {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, string $message = 'Success', int $statusCode = 200): void {
        self::json($data, $statusCode, $message);
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, $errors = null): void {
        // Clean any buffered output to prevent stray characters or notices before JSON
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function unauthorized(string $message = 'Unauthorized access'): void {
        self::error($message, 401);
    }

    public static function notFound(string $message = 'Resource not found'): void {
        self::error($message, 404);
    }

    public static function forbidden(string $message = 'Forbidden'): void {
        self::error($message, 403);
    }
}
