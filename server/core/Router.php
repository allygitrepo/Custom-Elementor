<?php
/**
 * LightBuilder - Lightweight REST Router
 */

namespace LightBuilder\Core;

use LightBuilder\Middleware\Response;
use Exception;

class Router {
    private array $routes = [];
    private string $basePath = '';

    public function __construct(string $basePath = '') {
        $this->basePath = rtrim($basePath, '/');
    }

    public function get(string $path, callable|array $handler, array $middleware = []): void {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable|array $handler, array $middleware = []): void {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable|array $handler, array $middleware = []): void {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function patch(string $path, callable|array $handler, array $middleware = []): void {
        $this->addRoute('PATCH', $path, $handler, $middleware);
    }

    public function delete(string $path, callable|array $handler, array $middleware = []): void {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $middleware = []): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => '/' . trim($path, '/'),
            'handler' => $handler,
            'middleware' => $middleware
        ];
    }

    public function dispatch(): void {
        $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

        // Normalize URL relative to API base path
        $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
        if ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.') {
            $scriptDir = '';
        }

        $uri = str_replace('\\', '/', $requestUri);

        // If this is an API call, strip any leading subfolder path directly to the API endpoint
        $apiPos = strpos($uri, '/api');
        if ($apiPos !== false) {
            $uri = substr($uri, $apiPos + 4);
            $uri = '/' . trim($uri, '/');
        } elseif (!empty($scriptDir) && strpos($uri, $scriptDir) === 0) {
            $uri = substr($uri, strlen($scriptDir));
            $uri = '/' . trim($uri, '/');
        } else {
            $uri = '/' . trim($uri, '/');
        }

        // Get JSON body if available
        $jsonBody = null;
        $rawInput = file_get_contents('php://input');
        if (!empty($rawInput)) {
            $jsonBody = json_decode($rawInput, true);
        }

        $matched = false;

        foreach ($this->routes as $route) {
            if ($route['method'] !== $requestMethod) {
                continue;
            }

            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                $matched = true;

                // Extract named params
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                // Run route middleware if any
                foreach ($route['middleware'] as $mw) {
                    if (is_callable($mw)) {
                        $mw();
                    }
                }

                try {
                    $handler = $route['handler'];
                    if (is_array($handler)) {
                        [$class, $method] = $handler;
                        $controller = new $class();
                        $controller->$method($params, $jsonBody);
                    } elseif (is_callable($handler)) {
                        $handler($params, $jsonBody);
                    }
                } catch (Exception $e) {
                    Response::error($e->getMessage(), 500);
                }

                return;
            }
        }

        if (!$matched) {
            $rawUri = $_SERVER['REQUEST_URI'] ?? '/';
            $isApiCall = (strpos($rawUri, '/api/') !== false || strpos($rawUri, '/api') === 0 || strpos($uri, '/api') === 0);

            // If this is a frontend GET navigation (not an API call), check for SPA index.html
            if ($requestMethod === 'GET' && !$isApiCall) {
                $possibleIndexFiles = [
                    ROOT_PATH . '/index.html',
                    __DIR__ . '/../index.html',
                    ROOT_PATH . '/dist/index.html',
                    dirname(ROOT_PATH) . '/client/dist/index.html'
                ];

                foreach ($possibleIndexFiles as $spaIndex) {
                    if (is_file($spaIndex)) {
                        header('Content-Type: text/html; charset=utf-8');
                        readfile($spaIndex);
                        return;
                    }
                }
            }

            Response::notFound("Endpoint not found: [{$requestMethod}] {$uri}");
        }
    }
}
