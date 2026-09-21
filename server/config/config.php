<?php
/**
 * LightBuilder V1 - Configuration
 */

// Environment settings
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Root paths
define('ROOT_PATH', dirname(__DIR__));
define('STORAGE_PATH', ROOT_PATH . '/storage');
define('DATABASE_PATH', STORAGE_PATH . '/database/lightbuilder.sqlite');
define('UPLOADS_PATH', ROOT_PATH . '/uploads');
define('PUBLISHED_PATH', ROOT_PATH . '/published');
define('LOGS_PATH', ROOT_PATH . '/logs');
define('TEMPLATES_PATH', ROOT_PATH . '/storage/templates');

// Session configuration
define('SESSION_LIFETIME', 86400 * 7); // 7 days
define('SESSION_NAME', 'lightbuilder_session');

// Version
define('LIGHTBUILDER_VERSION', '1.0.0');

// Ensure directories exist
$directories = [
    STORAGE_PATH,
    STORAGE_PATH . '/database',
    STORAGE_PATH . '/templates',
    UPLOADS_PATH,
    PUBLISHED_PATH,
    LOGS_PATH
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}
