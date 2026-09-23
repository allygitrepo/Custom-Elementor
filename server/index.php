<?php
/**
 * LightBuilder V1 - Front Controller & REST API Gateway
 */

// Start output buffering early to prevent any stray output or notices before JSON response
ob_start();

// If running via PHP CLI built-in web server and requested file exists, serve it directly
if (php_sapi_name() === 'cli-server') {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $uri = '/' . ltrim(preg_replace('#/+#', '/', $uri), '/');
    $file = __DIR__ . $uri;

    // Handle directory redirect if missing trailing slash
    if (is_dir($file) && !str_ends_with($uri, '/')) {
        header('Location: ' . $uri . '/', true, 301);
        exit;
    }

    // Handle directory with index.html
    if (is_dir($file) && is_file($file . '/index.html')) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($file . '/index.html');
        exit;
    }

    if (is_file($file) && !preg_match('/\.(php|sqlite|htaccess)$/i', $file)) {
        if (preg_match('/\.html$/i', $file)) {
            header('Content-Type: text/html; charset=utf-8');
        }
        return false;
    }
}

require_once __DIR__ . '/config/config.php';

// PSR-4 style autoloader for LightBuilder namespace
spl_autoload_register(function ($class) {
    $prefix = 'LightBuilder\\';
    $baseDir = __DIR__ . '/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    
    // Map sub-namespaces to lowercased directory names if needed
    $parts = explode('\\', $relativeClass);
    if (count($parts) > 1) {
        $parts[0] = strtolower($parts[0]);
    }
    
    $file = $baseDir . implode('/', $parts) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

use LightBuilder\Core\Router;
use LightBuilder\Middleware\CorsMiddleware;
use LightBuilder\Controllers\SetupController;
use LightBuilder\Controllers\AuthController;
use LightBuilder\Controllers\WebsiteController;
use LightBuilder\Controllers\PageController;
use LightBuilder\Controllers\MediaController;
use LightBuilder\Controllers\TemplateController;
use LightBuilder\Controllers\SettingsController;
use LightBuilder\Controllers\PublishController;

// Enable CORS
CorsMiddleware::handle();

// Initialize Router
$router = new Router();

// Setup routes
$router->get('/setup/status', [SetupController::class, 'getStatus']);
$router->post('/setup/install', [SetupController::class, 'install']);

// Auth routes
$router->post('/auth/login', [AuthController::class, 'login']);
$router->post('/auth/logout', [AuthController::class, 'logout']);
$router->get('/auth/me', [AuthController::class, 'me']);
$router->put('/auth/profile', [AuthController::class, 'updateProfile']);

// Website routes
$router->get('/websites', [WebsiteController::class, 'index']);
$router->post('/websites', [WebsiteController::class, 'create']);
$router->get('/websites/{id}', [WebsiteController::class, 'show']);
$router->put('/websites/{id}', [WebsiteController::class, 'update']);
$router->delete('/websites/{id}', [WebsiteController::class, 'delete']);
$router->post('/websites/{id}/duplicate', [WebsiteController::class, 'duplicate']);
$router->post('/websites/{id}/publish', [PublishController::class, 'publishWebsite']);

// Page routes
$router->get('/websites/{website_id}/pages', [PageController::class, 'indexByWebsite']);
$router->post('/websites/{website_id}/pages', [PageController::class, 'create']);
$router->get('/pages/{id}', [PageController::class, 'show']);
$router->put('/pages/{id}', [PageController::class, 'update']);
$router->post('/pages/{id}/save', [PageController::class, 'save']);
$router->post('/pages/{id}/duplicate', [PageController::class, 'duplicate']);
$router->delete('/pages/{id}', [PageController::class, 'delete']);
$router->post('/pages/{id}/publish', [PublishController::class, 'publishPage']);
$router->get('/pages/{id}/preview', [PublishController::class, 'previewPage']);

// Published static site serving routes
$router->get('/published/{slug}', [PublishController::class, 'servePublished']);
$router->get('/published/{slug}/{file}', [PublishController::class, 'servePublished']);
$router->get('/published/{slug}/uploads/{file}', [PublishController::class, 'servePublished']);

// Media routes
$router->get('/media', [MediaController::class, 'index']);
$router->post('/media/upload', [MediaController::class, 'upload']);
$router->delete('/media/{id}', [MediaController::class, 'delete']);

// Template routes
$router->get('/templates', [TemplateController::class, 'index']);
$router->get('/templates/{id}', [TemplateController::class, 'show']);
$router->post('/templates', [TemplateController::class, 'create']);

// Settings routes
$router->get('/settings', [SettingsController::class, 'index']);
$router->post('/settings', [SettingsController::class, 'update']);

// Dispatch request
$router->dispatch();
