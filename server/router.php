<?php
/**
 * LightBuilder - CLI Server Router
 */

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$uri = '/' . ltrim(preg_replace('#/+#', '/', $uri), '/');
$file = __DIR__ . $uri;

// If directory requested without trailing slash, redirect to maintain relative URLs
if (is_dir($file) && !str_ends_with($uri, '/')) {
    header('Location: ' . $uri . '/', true, 301);
    exit;
}

// If directory requested, check for index.html inside
if (is_dir($file) && is_file($file . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($file . '/index.html');
    exit;
}

// Serve static assets (images, css, js, html) directly if exists
if (is_file($file) && !preg_match('/\.(php|sqlite|htaccess)$/i', $file)) {
    if (preg_match('/\.html$/i', $file)) {
        header('Content-Type: text/html; charset=utf-8');
    }
    return false;
}

$_SERVER['SCRIPT_NAME'] = '/index.php';
require_once __DIR__ . '/index.php';
