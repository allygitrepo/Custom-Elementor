<?php
/**
 * LightBuilder - Template Controller
 */

namespace LightBuilder\Controllers;

use LightBuilder\Database\Database;
use LightBuilder\Middleware\Response;
use LightBuilder\Middleware\AuthMiddleware;
use Exception;

class TemplateController {
    public function index(array $params = [], ?array $body = null): void {
        AuthMiddleware::requireAuth();

        try {
            $db = Database::getConnection();
            $stmt = $db->query("SELECT id, name, category, thumbnail, created_at FROM templates ORDER BY id DESC");
            $templates = $stmt->fetchAll();

            // Built-in starter template if table is empty
            if (empty($templates)) {
                $templates = $this->getStarterTemplates();
            }

            Response::json($templates);
        } catch (Exception $e) {
            Response::error('Failed to fetch templates: ' . $e->getMessage(), 500);
        }
    }

    public function show(array $params = [], ?array $body = null): void {
        AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM templates WHERE id = ?");
            $stmt->execute([$id]);
            $template = $stmt->fetch();

            if (!$template) {
                // Check if it's one of starter templates
                $starters = $this->getStarterTemplates();
                foreach ($starters as $s) {
                    if ($s['id'] === $id) {
                        $template = $s;
                        break;
                    }
                }
            }

            if (!$template) {
                Response::notFound('Template not found');
            }

            if (is_string($template['content_json'])) {
                $template['content'] = json_decode($template['content_json'], true);
            } else {
                $template['content'] = $template['content_json'];
            }

            Response::json($template);
        } catch (Exception $e) {
            Response::error('Failed to fetch template: ' . $e->getMessage(), 500);
        }
    }

    public function create(array $params = [], ?array $body = null): void {
        AuthMiddleware::requireAuth();

        $name = trim($body['name'] ?? '');
        $category = trim($body['category'] ?? 'Custom');
        $thumbnail = trim($body['thumbnail'] ?? '');
        $content = $body['content'] ?? null;

        if (empty($name)) {
            Response::error('Template name is required.');
        }

        if (empty($content)) {
            Response::error('Template content is required.');
        }

        $contentJson = is_string($content) ? $content : json_encode($content);

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT INTO templates (name, category, thumbnail, content_json) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $category, $thumbnail, $contentJson]);
            $templateId = (int)$db->lastInsertId();

            $fetch = $db->prepare("SELECT * FROM templates WHERE id = ?");
            $fetch->execute([$templateId]);
            $template = $fetch->fetch();

            Response::success($template, 'Template saved successfully', 201);
        } catch (Exception $e) {
            Response::error('Failed to save template: ' . $e->getMessage(), 500);
        }
    }

    private function getStarterTemplates(): array {
        return [
            [
                'id' => 991,
                'name' => 'Modern Business Landing Page',
                'category' => 'Business',
                'thumbnail' => '',
                'content_json' => json_encode([
                    'id' => 'root',
                    'type' => 'container',
                    'settings' => [
                        'direction' => 'column',
                        'padding' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'gap' => '0px'
                    ],
                    'children' => [
                        [
                            'id' => 'hero_section_' . uniqid(),
                            'type' => 'container',
                            'settings' => [
                                'direction' => 'column',
                                'align' => 'center',
                                'justify' => 'center',
                                'padding' => ['top' => '100px', 'right' => '24px', 'bottom' => '100px', 'left' => '24px'],
                                'background' => '#0f172a',
                                'minHeight' => '70vh'
                            ],
                            'children' => [
                                [
                                    'id' => 'badge_' . uniqid(),
                                    'type' => 'heading',
                                    'settings' => [
                                        'text' => '✨ INTRODUCING NEXT-GEN BUILDER',
                                        'tag' => 'span',
                                        'align' => 'center',
                                        'color' => '#38bdf8',
                                        'fontSize' => ['desktop' => '14px', 'tablet' => '13px', 'mobile' => '12px'],
                                        'fontWeight' => '600',
                                        'letterSpacing' => '2px'
                                    ],
                                    'children' => []
                                ],
                                [
                                    'id' => 'hero_title_' . uniqid(),
                                    'type' => 'heading',
                                    'settings' => [
                                        'text' => 'Build Stunning Websites at Lightning Speed',
                                        'tag' => 'h1',
                                        'align' => 'center',
                                        'color' => '#ffffff',
                                        'fontSize' => ['desktop' => '54px', 'tablet' => '42px', 'mobile' => '32px'],
                                        'fontWeight' => '800',
                                        'margin' => ['top' => '16px', 'right' => '0px', 'bottom' => '16px', 'left' => '0px']
                                    ],
                                    'children' => []
                                ],
                                [
                                    'id' => 'hero_desc_' . uniqid(),
                                    'type' => 'text',
                                    'settings' => [
                                        'text' => '<p>Zero bloat, pixel-perfect visual precision, and automated static page generation for ultimate SEO performance.</p>',
                                        'align' => 'center',
                                        'color' => '#94a3b8',
                                        'fontSize' => ['desktop' => '20px', 'tablet' => '17px', 'mobile' => '16px'],
                                        'maxWidth' => '700px'
                                    ],
                                    'children' => []
                                ],
                                [
                                    'id' => 'hero_btn_group_' . uniqid(),
                                    'type' => 'container',
                                    'settings' => [
                                        'direction' => 'row',
                                        'align' => 'center',
                                        'justify' => 'center',
                                        'gap' => '16px',
                                        'margin' => ['top' => '32px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px']
                                    ],
                                    'children' => [
                                        [
                                            'id' => 'primary_cta_' . uniqid(),
                                            'type' => 'button',
                                            'settings' => [
                                                'text' => 'Get Started Free',
                                                'url' => '#',
                                                'background' => '#38bdf8',
                                                'textColor' => '#0f172a',
                                                'borderRadius' => '8px',
                                                'padding' => ['top' => '14px', 'right' => '32px', 'bottom' => '14px', 'left' => '32px'],
                                                'fontWeight' => '700'
                                            ],
                                            'children' => []
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ])
            ]
        ];
    }
}
