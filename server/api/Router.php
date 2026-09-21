<?php
/**
 * LightBuilder - Lightweight REST Router
 */

namespace LightBuilder\Api;

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
        $scriptName = dirname($_SERVER['SCRIPT_NAME'] ?? '');
        $uri = $requestUri;

        if ($scriptName !== '/' && $scriptName !== '\\' && strpos($uri, $scriptName) === 0) {
            $uri = substr($uri, strlen($scriptName));
        }

        $uri = '/' . trim($uri, '/');

        // Also normalize /api prefix if present
        if (strpos($uri, '/api') === 0) {
            $uri = substr($uri, 4);
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
            Response::notFound("Endpoint not found: [{$requestMethod}] {$uri}");
        }
    }
}
