<?php
/**
 * LightBuilder - High-Performance Static HTML/CSS Compiler
 * Compiles enterprise section widgets & responsive layouts into pure static HTML/CSS.
 */

namespace LightBuilder\Renderer;

class HtmlCompiler {
    private array $cssRules = [];
    private bool $hasAccordions = false;
    private bool $hasTabs = false;
    private bool $hasSliders = false;
    private bool $hasCounters = false;
    private bool $hasNav = false;

    public function resolveAssetUrl(?string $url): string {
        if (empty($url)) return '';
        
        // Data and Blob URIs
        if (str_starts_with($url, 'data:') || str_starts_with($url, 'blob:')) {
            return $url;
        }

        // If it's a URL or path that contains /uploads/...
        if (preg_match('/(?:^|\/)uploads\/(.+)$/', $url, $matches)) {
            return 'uploads/' . ltrim($matches[1], '/');
        }

        // External absolute URL (e.g. Unsplash, Google CDN)
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }

        return $url;
    }

    public function renderLucideIcon(string $name, string $class = '', int $size = 20, string $color = 'currentColor', float $strokeWidth = 2): string {
        $name = strtolower(trim(str_replace(['_', ' '], '-', $name)));
        $classAttr = !empty($class) ? ' ' . htmlspecialchars($class) : '';
        
        static $icons = [
            'zap' => '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
            'file-text' => '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
            'arrow-right' => '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
            'arrow-left' => '<path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>',
            'chevron-right' => '<path d="m9 18 6-6-6-6"></path>',
            'chevron-down' => '<path d="m6 9 6 6 6-6"></path>',
            'chevron-left' => '<path d="m15 18-6-6 6-6"></path>',
            'star' => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
            'check' => '<path d="M20 6 9 17l-5-5"></path>',
            'check-circle-2' => '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path>',
            'x' => '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
            'shield' => '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"></path>',
            'shield-check' => '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
            'sparkles' => '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path>',
            'award' => '<circle cx="12" cy="8" r="6"></circle><path d="m15.477 12.89 2.523 7.11-6-3-6 3 2.523-7.11"></path>',
            'activity' => '<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>',
            'layers' => '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>',
            'phone' => '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
            'mail' => '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
            'map-pin' => '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle>',
            'clock' => '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
            'globe' => '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>',
            'building' => '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>',
            'cpu' => '<rect width="16" height="16" x="4" y="4" rx="2"></rect><rect width="6" height="6" x="9" y="9" rx="1"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path>',
            'twitter' => '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>',
            'linkedin' => '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle>',
            'facebook' => '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>',
            'instagram' => '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>',
            'youtube' => '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path><polygon points="10 15 15 12 10 9 10 15"></polygon>',
            'github' => '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path>',
            'link' => '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
            'message-square' => '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
            'lock' => '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
        ];

        $innerSvg = $icons[$name] ?? ($icons['sparkles']);
        return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{$size}\" height=\"{$size}\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"{$color}\" stroke-width=\"{$strokeWidth}\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-{$name}{$classAttr}\" style=\"display: inline-block; vertical-align: middle;\">{$innerSvg}</svg>";
    }

    public function compilePage(array $page, array $website = []): string {
        $this->cssRules = [];
        $this->hasAccordions = false;
        $this->hasTabs = false;
        $this->hasSliders = false;
        $this->hasCounters = false;
        $this->hasNav = false;

        $title = htmlspecialchars($page['title'] ?? 'Untitled Page');
        $siteName = htmlspecialchars($website['name'] ?? 'LightBuilder');
        $currentSlug = trim($page['slug'] ?? 'home', '/');
        if (empty($currentSlug)) {
            $currentSlug = 'home';
        }
        
        $content = null;
        if (!empty($page['content_json']) && is_string($page['content_json'])) {
            $content = json_decode($page['content_json'], true);
        } elseif (!empty($page['content']) && is_array($page['content'])) {
            $content = $page['content'];
        }

        // Render site navigation header if website has multiple pages
        $navHtml = '';
        $pages = $website['pages'] ?? [];
        if (!empty($pages) && count($pages) > 1) {
            $navHtml = $this->renderSiteNav($siteName, $pages, $currentSlug, $website['slug'] ?? '');
            $this->hasNav = true;
        }
        
        $bodyHtml = $this->renderNode($content ?: ['id' => 'root', 'type' => 'container', 'settings' => [], 'children' => []]);
        $compiledCss = $this->generateCss();
        $compiledJs = $this->generateJs();

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title} - {$siteName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        /* Base Reset & Typography */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html {
            scroll-behavior: smooth;
            scroll-padding-top: 80px;
        }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #070a0f;
            color: #f8fafc;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }
        img { max-width: 100%; height: auto; display: block; }
        a { color: inherit; text-decoration: none; }
        video::-webkit-media-controls-overflow-button,
        video::-internal-media-controls-overflow-button,
        video::-webkit-media-controls-overflow-menu-list,
        video::-webkit-media-controls-download-button,
        video::-webkit-media-controls-playback-rate-button,
        video::-webkit-media-controls-toggle-closed-captions-button,
        video::-webkit-media-controls-cast-button {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden !important;
        }
        {$compiledCss}
    </style>
</head>
<body>
    {$navHtml}
    {$bodyHtml}
    {$compiledJs}
</body>
</html>
HTML;
    }

    private function renderSiteNav(string $siteName, array $pages, string $currentSlug, string $siteSlug = ''): string {
        $linksHtml = '';
        $mobileLinksHtml = '';
        $isHomeCurrent = ($currentSlug === 'home' || $currentSlug === 'index');

        foreach ($pages as $p) {
            $pSlug = trim($p['slug'] ?? 'home', '/');
            if (empty($pSlug)) {
                $pSlug = 'home';
            }

            $pTitle = htmlspecialchars($p['title'] ?? 'Page');
            $isPHome = ($pSlug === 'home' || $pSlug === 'index');
            $fileName = $isPHome ? 'index.html' : ($pSlug . '.html');
            
            $isActive = ($pSlug === $currentSlug) || ($isHomeCurrent && $isPHome);
            $activeClass = $isActive ? 'active' : '';

            $linksHtml .= "<a href=\"{$fileName}\" class=\"lb-nav-link {$activeClass}\">{$pTitle}</a>\n";
            $mobileLinksHtml .= "<a href=\"{$fileName}\" class=\"lb-mobile-nav-link {$activeClass}\">{$pTitle}</a>\n";
        }

        $zapIcon = $this->renderLucideIcon('zap', '', 18, '#38bdf8');
        return <<<HTML
<header class="lb-site-header">
    <div class="lb-site-header-inner">
        <a href="index.html" class="lb-site-logo">
            <span class="lb-site-logo-icon">{$zapIcon}</span>
            <span class="lb-site-logo-text">{$siteName}</span>
        </a>
        <nav class="lb-site-nav">
            {$linksHtml}
        </nav>
        <button class="lb-mobile-nav-toggle" aria-label="Toggle navigation menu" onclick="toggleMobileNav(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
        </button>
    </div>
    <div class="lb-mobile-nav-menu" id="lbMobileMenu" style="display: none;">
        {$mobileLinksHtml}
    </div>
</header>
HTML;
    }

    private function renderHighlightedText(string $title, string $highlight, string $highlightColor = '#38bdf8'): string {
        $safeTitle = htmlspecialchars($title);
        $safeHighlight = htmlspecialchars($highlight);
        if (empty($safeHighlight)) {
            return $safeTitle;
        }

        $pos = stripos($safeTitle, $safeHighlight);
        if ($pos === false) {
            return $safeTitle;
        }

        $start = substr($safeTitle, 0, $pos);
        $match = substr($safeTitle, $pos, strlen($safeHighlight));
        $end = substr($safeTitle, $pos + strlen($safeHighlight));

        return "{$start}<span style=\"color: {$highlightColor}; font-weight: 800;\">{$match}</span>{$end}";
    }

    private function renderNode(array $node): string {
        if (empty($node) || !isset($node['type'])) {
            return '';
        }

        $type = $node['type'];
        $id = $node['id'] ?? uniqid('el_');
        $settings = $node['settings'] ?? [];
        $children = $node['children'] ?? [];

        $classId = 'lb-' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $id);
        $this->generateNodeCss($classId, $type, $settings);

        $customClass = !empty($settings['cssClass']) ? ' ' . htmlspecialchars($settings['cssClass']) : '';
        $rawSectionId = trim($settings['sectionId'] ?? ($settings['anchorId'] ?? ''));
        $sectionIdAttr = !empty($rawSectionId) ? ' id="' . htmlspecialchars(ltrim($rawSectionId, '#')) . '"' : '';

        switch ($type) {
            case 'section':
            case 'container':
                $innerHtml = '';
                foreach ($children as $child) {
                    $innerHtml .= $this->renderNode($child);
                }
                return "<div class=\"{$classId}{$customClass}\"{$sectionIdAttr}>{$innerHtml}</div>";

            case 'heading':
                $tag = in_array($settings['tag'] ?? 'h2', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span']) ? $settings['tag'] : 'h2';
                $text = htmlspecialchars($settings['text'] ?? 'Heading');
                return "<{$tag} class=\"{$classId}\">{$text}</{$tag}>";

            case 'text':
                $text = $settings['text'] ?? '<p>Paragraph text</p>';
                return "<div class=\"{$classId}\">{$text}</div>";

            case 'image':
                $url = htmlspecialchars($this->resolveAssetUrl($settings['url'] ?? ''));
                $alt = htmlspecialchars($settings['alt'] ?? 'Image');
                $link = $settings['linkUrl'] ?? '';
                $imgTag = "<img src=\"{$url}\" alt=\"{$alt}\" class=\"{$classId}-img\" />";
                if (!empty($link)) {
                    $imgTag = "<a href=\"" . htmlspecialchars($link) . "\">{$imgTag}</a>";
                }
                return "<div class=\"{$classId}\">{$imgTag}</div>";

            case 'video': {
                $rawUrl = $this->resolveAssetUrl($settings['url'] ?? '');
                if (empty($rawUrl)) {
                    return '';
                }
                $showControls = (!empty($settings['controls']) && $settings['controls'] !== 'false');
                $controls = $showControls ? 'controls' : '';
                $autoplay = (!isset($settings['autoplay']) || (!empty($settings['autoplay']) && $settings['autoplay'] !== 'false')) ? 'autoplay' : '';
                $loop = (!isset($settings['loop']) || (!empty($settings['loop']) && $settings['loop'] !== 'false')) ? 'loop' : '';
                $muted = (!isset($settings['muted']) || (!empty($settings['muted']) && $settings['muted'] !== 'false') || !empty($autoplay)) ? 'muted' : '';
                $aspectRatio = htmlspecialchars($settings['aspectRatio'] ?? '16/9');
                $borderRadius = htmlspecialchars($settings['borderRadius'] ?? '12px');
                $maxWidth = htmlspecialchars($settings['maxWidth'] ?? '100%');

                $isEmbed = ($settings['sourceType'] ?? '') === 'embed' 
                    || strpos($rawUrl, 'youtube.com') !== false 
                    || strpos($rawUrl, 'youtu.be') !== false 
                    || strpos($rawUrl, 'vimeo.com') !== false;

                $embedSrc = $rawUrl;
                if (strpos($rawUrl, 'youtube.com/watch?v=') !== false) {
                    $embedSrc = str_replace('watch?v=', 'embed/', $rawUrl);
                } elseif (strpos($rawUrl, 'youtu.be/') !== false) {
                    $parts = explode('youtu.be/', $rawUrl);
                    $id = explode('?', $parts[1] ?? '')[0];
                    $embedSrc = "https://www.youtube.com/embed/{$id}";
                } elseif (strpos($rawUrl, 'vimeo.com/') !== false && strpos($rawUrl, 'player.vimeo.com') === false) {
                    $parts = explode('vimeo.com/', $rawUrl);
                    $id = explode('?', $parts[1] ?? '')[0];
                    $embedSrc = "https://player.vimeo.com/video/{$id}";
                }

                $embedSrcEscaped = htmlspecialchars($embedSrc);
                $urlEscaped = htmlspecialchars($rawUrl);

                if ($isEmbed) {
                    return "<div class=\"{$classId} lb-video-wrap\" style=\"max-width: {$maxWidth}; border-radius: {$borderRadius}; aspect-ratio: {$aspectRatio}; position: relative; overflow: hidden; background: #000;\"{$sectionIdAttr}>
                        <iframe src=\"{$embedSrcEscaped}\" title=\"Video Player\" style=\"position: absolute; inset: 0; width: 100%; height: 100%; border: 0;\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>
                    </div>";
                } else {
                    return "<div class=\"{$classId} lb-video-wrap\" style=\"max-width: {$maxWidth}; border-radius: {$borderRadius}; aspect-ratio: {$aspectRatio}; position: relative; overflow: hidden; background: #000;\"{$sectionIdAttr}>
                        <video src=\"{$urlEscaped}\" " . (!empty($poster) ? "poster=\"{$poster}\"" : '') . " {$controls} {$autoplay} {$loop} {$muted} controlsList=\"nodownload noplaybackrate\" disablePictureInPicture disableRemotePlayback playsinline style=\"width: 100%; height: 100%; object-fit: cover; display: block;\"></video>
                    </div>";
                }
            }

            case 'button':
                $text = htmlspecialchars($settings['text'] ?? 'Click Here');
                $url = htmlspecialchars($this->resolveAssetUrl($settings['url'] ?? '#'));
                $target = htmlspecialchars($settings['target'] ?? '_self');
                $align = $settings['align'] ?? 'left';
                return "<div class=\"{$classId}-wrap\" style=\"text-align: {$align};\"><a href=\"{$url}\" target=\"{$target}\" class=\"{$classId}\">{$text}</a></div>";

            case 'spacer':
                return "<div class=\"{$classId}\"></div>";

            case 'divider':
                return "<div class=\"{$classId}\"><hr class=\"{$classId}-line\" /></div>";

            case 'map_embed': {
                $query = urlencode($settings['query'] ?? 'San Francisco, CA');
                $h = htmlspecialchars($settings['height'] ?? '350px');
                return "<div class=\"{$classId} lb-map-wrap\" style=\"height: {$h};\"{$sectionIdAttr}>
                    <iframe src=\"https://maps.google.com/maps?q={$query}&t=&z=13&ie=UTF8&iwloc=&output=embed\" frameborder=\"0\" allowfullscreen loading=\"lazy\"></iframe>
                </div>";
            }

            case 'code_block': {
                $fn = htmlspecialchars($settings['filename'] ?? 'config.json');
                $lang = htmlspecialchars($settings['language'] ?? 'json');
                $code = htmlspecialchars($settings['code'] ?? '// code snippet');

                return "<div class=\"{$classId} lb-code-wrap\"{$sectionIdAttr}>
                    <div class=\"lb-code-bar\">
                        <div class=\"lb-code-file\"><span></span>{$fn}</div>
                        <span class=\"lb-code-lang\">{$lang}</span>
                    </div>
                    <pre class=\"lb-code-content\"><code>{$code}</code></pre>
                </div>";
            }

            case 'html':
                return $settings['code'] ?? '';

            // ── 1. NAVBAR HEADER ──
            case 'nav_header': {
                $brand = htmlspecialchars($settings['brandName'] ?? 'BrandName');
                $logoUrl = htmlspecialchars($this->resolveAssetUrl($settings['logoUrl'] ?? ''));
                $catalogText = htmlspecialchars($settings['catalogText'] ?? 'Brochure');
                $catalogUrl = htmlspecialchars($this->resolveAssetUrl($settings['catalogUrl'] ?? '#contact'));
                $ctaText = htmlspecialchars($settings['ctaText'] ?? 'Get Quote');
                $ctaUrl = htmlspecialchars($this->resolveAssetUrl($settings['ctaUrl'] ?? '#contact'));
                
                $logoHeight = htmlspecialchars($settings['logoHeight'] ?? '38px');
                $logoWidth = htmlspecialchars($settings['logoWidth'] ?? '160px');
                $logoFit = htmlspecialchars($settings['logoFit'] ?? 'contain');
                
                $showBrandText = ($settings['showBrandText'] ?? true) !== false;
                $showCatalog = ($settings['showCatalogBtn'] ?? true) !== false && !empty(trim($settings['catalogText'] ?? 'Brochure'));
                $showCta = ($settings['showCtaBtn'] ?? true) !== false && !empty(trim($settings['ctaText'] ?? 'Get Quote'));

                $links = explode(',', $settings['links'] ?? 'About, Products, Features, Contact');
                $navLinksHtml = '';
                foreach ($links as $l) {
                    $item = trim($l);
                    if (!empty($item)) {
                        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $item));
                        $navLinksHtml .= "<a href=\"#{$slug}\" class=\"lb-header-navlink\">" . htmlspecialchars($item) . "</a>";
                    }
                }

                $brandSpan = $showBrandText ? "<span class=\"lb-header-brand-title\">{$brand}</span>" : '';
                $badgeIcon = $this->renderLucideIcon('zap', '', 18, '#070a0f');
                $logoHtml = !empty($logoUrl)
                    ? "<img src=\"{$logoUrl}\" alt=\"{$brand}\" class=\"lb-header-logo-img\" style=\"height: {$logoHeight}; max-height: {$logoHeight}; max-width: {$logoWidth}; width: auto; object-fit: {$logoFit}; display: block;\" />{$brandSpan}"
                    : "<div class=\"lb-header-logo-badge\">{$badgeIcon}</div>{$brandSpan}";

                $actionsHtml = '';
                $mobileActionsHtml = '';
                if ($showCatalog || $showCta) {
                    $fileIcon = $this->renderLucideIcon('file-text', '', 14, '#ffffff');
                    $arrowIcon = $this->renderLucideIcon('arrow-right', '', 14, '#070a0f');
                    $actionsHtml .= "<div class=\"lb-navbar-actions\">";
                    if ($showCatalog) {
                        $actionsHtml .= "<a href=\"{$catalogUrl}\" class=\"lb-navbar-brochure-btn\"><span>{$fileIcon}</span> {$catalogText}</a>";
                        $mobileActionsHtml .= "<a href=\"{$catalogUrl}\" class=\"lb-navbar-brochure-btn lb-mobile-only\"><span>{$fileIcon}</span> {$catalogText}</a>";
                    }
                    if ($showCta) {
                        $actionsHtml .= "<a href=\"{$ctaUrl}\" class=\"lb-navbar-cta-btn\">{$ctaText} {$arrowIcon}</a>";
                    }
                    $actionsHtml .= "</div>";
                }

                $hamburgerHtml = "<button type=\"button\" class=\"lb-navbar-toggle\" aria-label=\"Toggle Menu\" onclick=\"this.closest('.lb-navbar-header').classList.toggle('lb-menu-open')\">
                    <span class=\"lb-bar\"></span>
                    <span class=\"lb-bar\"></span>
                    <span class=\"lb-bar\"></span>
                </button>";

                return "<header class=\"{$classId} lb-navbar-header\"{$sectionIdAttr}>
                    <div class=\"lb-navbar-inner\">
                        <a href=\"#\" class=\"lb-navbar-brand\">{$logoHtml}</a>
                        <nav class=\"lb-navbar-links\">{$navLinksHtml}</nav>
                        <div class=\"lb-navbar-right\">
                            {$actionsHtml}
                            {$hamburgerHtml}
                        </div>
                    </div>
                    <div class=\"lb-navbar-mobile-drawer\">
                        <nav class=\"lb-mobile-navlinks\">{$navLinksHtml}</nav>
                        {$mobileActionsHtml}
                    </div>
                </header>";
            }

            // ── 2. HERO SLIDER ──
            case 'hero_slider': {
                $this->hasSliders = true;
                $tag = htmlspecialchars($settings['tag'] ?? 'WELCOME TO OUR PLATFORM');
                $title = $settings['title'] ?? 'Build Your Next Digital Experience';
                $italicWords = $settings['italicWords'] ?? 'Digital Experience';
                $renderedTitle = $this->renderHighlightedText($title, $italicWords, '#38bdf8');
                $desc = htmlspecialchars($settings['description'] ?? '');
                $pBtnText = htmlspecialchars($settings['primaryBtnText'] ?? 'Get Started');
                $pBtnUrl = htmlspecialchars($this->resolveAssetUrl($settings['primaryBtnUrl'] ?? '#products'));
                $sBtnText = htmlspecialchars($settings['secondaryBtnText'] ?? 'Contact Us');
                $sBtnUrl = htmlspecialchars($this->resolveAssetUrl($settings['secondaryBtnUrl'] ?? '#contact'));

                $showTag = ($settings['showTag'] ?? true) !== false && !empty(trim($settings['tag'] ?? 'WELCOME TO OUR PLATFORM'));
                $showDesc = ($settings['showDescription'] ?? true) !== false && !empty(trim($settings['description'] ?? ''));
                $showPrimary = ($settings['showPrimaryBtn'] ?? true) !== false && !empty(trim($settings['primaryBtnText'] ?? 'Get Started'));
                $showSecondary = ($settings['showSecondaryBtn'] ?? true) !== false && !empty(trim($settings['secondaryBtnText'] ?? 'Contact Us'));

                $slidesList = [];
                if (!empty($settings['slides']) && is_array($settings['slides'])) {
                    foreach ($settings['slides'] as $s) {
                        $img = is_string($s) ? $s : ($s['image'] ?? '');
                        if (!empty($img)) {
                            $slidesList[] = $img;
                        }
                    }
                }
                if (empty($slidesList)) {
                    $slidesList = [
                        $settings['slide1Image'] ?? 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
                        $settings['slide2Image'] ?? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
                        $settings['slide3Image'] ?? 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80'
                    ];
                }

                $slidesHtml = '';
                $dotsHtml = '';
                $numSlides = count($slidesList);
                $showControls = ($settings['showSlideControls'] ?? true) !== false && $numSlides > 1;

                foreach ($slidesList as $idx => $sImg) {
                    $activeClass = $idx === 0 ? 'active' : '';
                    $sEscaped = htmlspecialchars($this->resolveAssetUrl($sImg));
                    $slidesHtml .= "<div class=\"lb-hero-bg-layer lb-hero-slide {$activeClass}\" style=\"background-image: url('{$sEscaped}');\"></div>\n";
                    $dotsHtml .= "<span class=\"lb-hero-dot {$activeClass}\" onclick=\"goToHeroSlide('{$classId}', {$idx})\"></span>\n";
                }

                $tagBadgeHtml = $showTag ? "<div class=\"lb-hero-tag-badge\"><span class=\"lb-hero-tag-dot\"></span> {$tag}</div>" : '';
                $descHtml = $showDesc ? "<p class=\"lb-hero-main-desc\">{$desc}</p>" : '';
                
                $btnRowHtml = '';
                if ($showPrimary || $showSecondary) {
                    $btnRowHtml .= "<div class=\"lb-hero-btn-row\">";
                    if ($showPrimary) {
                        $btnRowHtml .= "<a href=\"{$pBtnUrl}\" class=\"lb-hero-primary-btn\">{$pBtnText} →</a>";
                    }
                    if ($showSecondary) {
                        $btnRowHtml .= "<a href=\"{$sBtnUrl}\" class=\"lb-hero-secondary-btn\"><span>💬</span> {$sBtnText}</a>";
                    }
                    $btnRowHtml .= "</div>";
                }

                return "<section class=\"{$classId} lb-hero-slider\"{$sectionIdAttr} data-slides=\"{$numSlides}\">
                    {$slidesHtml}
                    <div class=\"lb-hero-overlay\"></div>
                    <div class=\"lb-hero-content-wrap\">
                        {$tagBadgeHtml}
                        <h1 class=\"lb-hero-main-title\">{$renderedTitle}</h1>
                        {$descHtml}
                        {$btnRowHtml}
                    </div>
                    " . ($showControls ? "<div class=\"lb-hero-slider-controls\">
                        <button class=\"lb-hero-arrow lb-hero-prev\" onclick=\"changeHeroSlide('{$classId}', -1)\">‹</button>
                        <div class=\"lb-hero-dots\">
                            {$dotsHtml}
                        </div>
                        <button class=\"lb-hero-arrow lb-hero-next\" onclick=\"changeHeroSlide('{$classId}', 1)\">›</button>
                    </div>" : '') . "
                </section>";
            }

            // ── 3. ANIMATED STATS BAR ──
            case 'animated_stats_bar': {
                $stats = [];
                if (!empty($settings['stats']) && is_array($settings['stats'])) {
                    foreach ($settings['stats'] as $st) {
                        $stats[] = [
                            'num' => $st['number'] ?? ($st['num'] ?? ''),
                            'label' => $st['label'] ?? ''
                        ];
                    }
                }
                if (empty($stats)) {
                    $stats = [
                        ['num' => $settings['s1Num'] ?? '10K+', 'label' => $settings['s1Label'] ?? 'Active Clients'],
                        ['num' => $settings['s2Num'] ?? '99.9%', 'label' => $settings['s2Label'] ?? 'Satisfaction Rate'],
                        ['num' => $settings['s3Num'] ?? '500+', 'label' => $settings['s3Label'] ?? 'Projects Completed'],
                        ['num' => $settings['s4Num'] ?? '24/7', 'label' => $settings['s4Label'] ?? 'Dedicated Support']
                    ];
                }

                $colsHtml = '';
                foreach ($stats as $st) {
                    $num = htmlspecialchars($st['num']);
                    $lab = htmlspecialchars($st['label']);
                    $colsHtml .= "<div class=\"lb-metric-col\"><div class=\"lb-metric-number\">{$num}</div><div class=\"lb-metric-title\">{$lab}</div></div>";
                }

                return "<section class=\"{$classId} lb-stats-metric-bar\"{$sectionIdAttr}>
                    <div class=\"lb-stats-metric-inner\">
                        {$colsHtml}
                    </div>
                </section>";
            }

            // ── 4. ABOUT SHOWCASE ──
            case 'about_showcase': {
                $badge = htmlspecialchars($settings['badge'] ?? 'ABOUT OUR COMPANY');
                $title = $settings['title'] ?? 'Delivering Quality and Scalable Solutions';
                $highlight = $settings['highlightWord'] ?? 'Scalable Solutions';
                $renderedTitle = $this->renderHighlightedText($title, $highlight, '#38bdf8');
                $desc = htmlspecialchars($settings['description'] ?? '');
                $imgUrl = htmlspecialchars($this->resolveAssetUrl($settings['imageUrl'] ?? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80'));
                $badgeTitle = htmlspecialchars($settings['badgeCardTitle'] ?? 'Industry Certified');
                $badgeSub = htmlspecialchars($settings['badgeCardSubtitle'] ?? 'International Quality Standards');

                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'ABOUT OUR COMPANY'));
                $showTechBadges = ($settings['showTechBadges'] ?? true) !== false;
                $showBullets = ($settings['showBullets'] ?? true) !== false;
                $showBadgeCard = ($settings['showBadgeCard'] ?? true) !== false && !empty(trim($settings['badgeCardTitle'] ?? 'Industry Certified'));

                $techBadges = explode(',', $settings['techBadges'] ?? 'Certified Quality, Secure Architecture, Fast Deployment, 24/7 Support');
                $badgesHtml = '';
                if ($showTechBadges) {
                    foreach ($techBadges as $b) {
                        $tb = trim($b);
                        if (!empty($tb)) {
                            $badgesHtml .= "<span class=\"lb-about-badge-chip\">" . htmlspecialchars($tb) . "</span>";
                        }
                    }
                }

                $bullets = [
                    $settings['h1'] ?? 'Enterprise-grade reliability and security standards',
                    $settings['h2'] ?? 'Custom infrastructure built for your exact needs',
                    $settings['h3'] ?? 'Precision engineered with modern methodologies',
                    $settings['h4'] ?? 'Dedicated team of industry domain specialists'
                ];
                $bulletsHtml = '';
                if ($showBullets) {
                    $checkIcon = $this->renderLucideIcon('check', '', 14, '#10b981');
                    foreach ($bullets as $bullet) {
                        if (!empty(trim($bullet))) {
                            $bulletsHtml .= "<div class=\"lb-about-bullet-item\"><span class=\"lb-about-check-icon\">{$checkIcon}</span><span>" . htmlspecialchars($bullet) . "</span></div>";
                        }
                    }
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';
                $chipsRowHtml = !empty($badgesHtml) ? "<div class=\"lb-about-chips-row\">{$badgesHtml}</div>" : '';
                $bulletsListHtml = !empty($bulletsHtml) ? "<div class=\"lb-about-bullets-list\">{$bulletsHtml}</div>" : '';
                
                $shieldIcon = $this->renderLucideIcon('shield-check', '', 26, '#38bdf8');
                $certCardHtml = $showBadgeCard ? "<div class=\"lb-about-cert-card\">
                    <div class=\"lb-about-cert-icon\">{$shieldIcon}</div>
                    <div>
                        <div class=\"lb-about-cert-title\">{$badgeTitle}</div>
                        <div class=\"lb-about-cert-sub\">{$badgeSub}</div>
                    </div>
                </div>" : '';

                return "<section class=\"{$classId} lb-about-showcase\"{$sectionIdAttr}>
                    <div class=\"lb-about-grid\">
                        <div class=\"lb-about-content-col\">
                            {$badgeEyebrowHtml}
                            <h2 class=\"lb-about-heading\">{$renderedTitle}</h2>
                            <p class=\"lb-about-desc\">{$desc}</p>
                            {$chipsRowHtml}
                            {$bulletsListHtml}
                        </div>
                        <div class=\"lb-about-media-col\">
                            <div class=\"lb-about-img-frame\">
                                <img src=\"{$imgUrl}\" alt=\"{$badgeTitle}\" class=\"lb-about-photo\" />
                                {$certCardHtml}
                            </div>
                        </div>
                    </div>
                </section>";
            }

            // ── 5. PRODUCT TABS SHOWCASE ──
            case 'product_tabs_showcase': {
                $this->hasTabs = true;
                $badge = htmlspecialchars($settings['badge'] ?? 'OUR CORE PRODUCTS');
                $title = $settings['title'] ?? 'Engineered Solutions for Every Project';
                $highlight = $settings['highlightWord'] ?? 'Every Project';
                $renderedTitle = $this->renderHighlightedText($title, $highlight, '#38bdf8');

                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'OUR CORE PRODUCTS'));
                $showDatasheet = ($settings['showDatasheetBtn'] ?? true) !== false;
                $showSpecs = ($settings['showSpecsTable'] ?? true) !== false;

                $products = [];
                if (!empty($settings['tabs']) && is_array($settings['tabs'])) {
                    foreach ($settings['tabs'] as $t) {
                        $products[] = [
                            'tab' => $t['tabName'] ?? ($t['tab'] ?? 'Product'),
                            'title' => $t['title'] ?? 'Product Title',
                            'desc' => $t['description'] ?? ($t['desc'] ?? ''),
                            'image' => $t['image'] ?? ($t['img'] ?? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'),
                            'specs' => [
                                ['label' => 'Core Gauge', 'val' => $t['specCore'] ?? 'Standard Gauge'],
                                ['label' => 'Coating / Finish', 'val' => $t['specCoating'] ?? 'Protective Finish'],
                                ['label' => 'Tensile Load', 'val' => $t['specTensile'] ?? 'High Durability']
                            ]
                        ];
                    }
                }
                if (empty($products)) {
                    $products = [
                        [
                            'tab' => $settings['p1Tab'] ?? 'Solution A',
                            'title' => $settings['p1Title'] ?? 'Primary Enterprise Edition',
                            'desc' => $settings['p1Desc'] ?? '',
                            'image' => $settings['p1Image'] ?? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                            'specs' => [
                                ['label' => 'Specification 1', 'val' => $settings['p1SpecCore'] ?? 'Standard Spec 1'],
                                ['label' => 'Feature 2', 'val' => $settings['p1SpecBarb'] ?? 'Feature Detail 2'],
                                ['label' => 'Finish', 'val' => $settings['p1SpecCoating'] ?? 'Premium Finish'],
                                ['label' => 'Rating', 'val' => $settings['p1SpecTensile'] ?? 'Maximum Durability']
                            ]
                        ],
                        [
                            'tab' => $settings['p2Tab'] ?? 'Solution B',
                            'title' => $settings['p2Title'] ?? 'Advanced Scaled Edition',
                            'desc' => $settings['p2Desc'] ?? '',
                            'image' => $settings['p2Image'] ?? 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
                            'specs' => [
                                ['label' => 'Specification 1', 'val' => 'Custom Configuration'],
                                ['label' => 'Feature 2', 'val' => 'Dedicated Bandwidth'],
                                ['label' => 'Finish', 'val' => 'Enhanced Protection'],
                                ['label' => 'Rating', 'val' => 'High Capacity']
                            ]
                        ],
                        [
                            'tab' => $settings['p3Tab'] ?? 'Solution C',
                            'title' => $settings['p3Title'] ?? 'Custom Enterprise Suite',
                            'desc' => $settings['p3Desc'] ?? '',
                            'image' => $settings['p3Image'] ?? 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80',
                            'specs' => [
                                ['label' => 'Specification 1', 'val' => 'Tailored Build'],
                                ['label' => 'Feature 2', 'val' => 'On-Site Integration'],
                                ['label' => 'Finish', 'val' => 'Custom Finish'],
                                ['label' => 'Rating', 'val' => 'Full SLA Guarantee']
                            ]
                        ]
                    ];
                }

                $tabsButtonsHtml = '';
                $tabPanesHtml = '';

                foreach ($products as $idx => $prod) {
                    $activeClass = $idx === 0 ? 'active' : '';
                    $tName = htmlspecialchars($prod['tab']);
                    $pTitle = htmlspecialchars($prod['title']);
                    $pDesc = htmlspecialchars($prod['desc']);
                    $pImg = htmlspecialchars($this->resolveAssetUrl($prod['image']));

                    $tabsButtonsHtml .= "<button class=\"lb-prod-tab-btn {$activeClass}\" onclick=\"switchProdTab(this, '{$classId}', {$idx})\">{$tName}</button>";

                    $specsHtml = '';
                    if ($showSpecs) {
                        foreach ($prod['specs'] as $sp) {
                            $sLab = htmlspecialchars($sp['label']);
                            $sVal = htmlspecialchars($sp['val']);
                            $specsHtml .= "<div class=\"lb-prod-spec-row\"><span class=\"lb-spec-label\">{$sLab}</span><span class=\"lb-spec-val\">{$sVal}</span></div>";
                        }
                    }

                    $specsTableHtml = !empty($specsHtml) ? "<div class=\"lb-prod-specs-table\">{$specsHtml}</div>" : '';
                    $datasheetActionHtml = $showDatasheet ? "<div class=\"lb-prod-pane-actions\"><a href=\"#contact\" class=\"lb-prod-quote-btn\">Request Information →</a></div>" : '';

                    $tabPanesHtml .= "<div class=\"lb-prod-pane {$activeClass}\" data-pane=\"{$idx}\">
                        <div class=\"lb-prod-pane-grid\">
                            <div class=\"lb-prod-img-wrap\">
                                <img src=\"{$pImg}\" alt=\"{$pTitle}\" class=\"lb-prod-pane-img\" />
                            </div>
                            <div class=\"lb-prod-details-col\">
                                <div class=\"lb-prod-category-tag\">PRODUCT SPECIFICATION</div>
                                <h3 class=\"lb-prod-pane-title\">{$pTitle}</h3>
                                <p class=\"lb-prod-pane-desc\">{$pDesc}</p>
                                {$specsTableHtml}
                                {$datasheetActionHtml}
                            </div>
                        </div>
                    </div>";
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';

                return "<section class=\"{$classId} lb-product-tabs-section\"{$sectionIdAttr}>
                    <div class=\"lb-section-header-center\">
                        {$badgeEyebrowHtml}
                        <h2 class=\"lb-section-center-heading\">{$renderedTitle}</h2>
                    </div>
                    <div class=\"lb-prod-tabs-nav\">{$tabsButtonsHtml}</div>
                    <div class=\"lb-prod-tabs-content\">{$tabPanesHtml}</div>
                </section>";
            }

            // ── 6. APPLICATIONS GRID ──
            case 'applications_grid': {
                $badge = htmlspecialchars($settings['badge'] ?? 'APPLICATIONS');
                $title = $settings['title'] ?? 'Versatile Solutions Across Multiple Industries';
                $highlight = $settings['highlightWord'] ?? 'Multiple Industries';
                $renderedTitle = $this->renderHighlightedText($title, $highlight, '#38bdf8');
                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'APPLICATIONS'));

                $apps = [];
                if (!empty($settings['cards']) && is_array($settings['cards'])) {
                    foreach ($settings['cards'] as $c) {
                        $apps[] = [
                            't' => $c['title'] ?? 'Application',
                            'd' => $c['description'] ?? ($c['desc'] ?? ''),
                            'img' => $c['image'] ?? ($c['img'] ?? 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80')
                        ];
                    }
                }
                if (empty($apps)) {
                    $apps = [
                        [
                            't' => $settings['a1Title'] ?? 'Commercial & Infrastructure',
                            'd' => $settings['a1Desc'] ?? '',
                            'img' => $settings['a1Image'] ?? 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80'
                        ],
                        [
                            't' => $settings['a2Title'] ?? 'Security & Enterprise',
                            'd' => $settings['a2Desc'] ?? '',
                            'img' => $settings['a2Image'] ?? 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80'
                        ],
                        [
                            't' => $settings['a3Title'] ?? 'Industrial & Large Acreage',
                            'd' => $settings['a3Desc'] ?? '',
                            'img' => $settings['a3Image'] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
                        ]
                    ];
                }

                $cardsHtml = '';
                foreach ($apps as $a) {
                    $aTitle = htmlspecialchars($a['t']);
                    $aDesc = htmlspecialchars($a['d']);
                    $aImg = htmlspecialchars($this->resolveAssetUrl($a['img']));
                    $cardsHtml .= "<div class=\"lb-app-card\">
                        <div class=\"lb-app-img-wrap\"><img src=\"{$aImg}\" alt=\"{$aTitle}\" class=\"lb-app-photo\" /></div>
                        <div class=\"lb-app-card-body\">
                            <h4 class=\"lb-app-card-title\">{$aTitle}</h4>
                            <p class=\"lb-app-card-desc\">{$aDesc}</p>
                        </div>
                    </div>";
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';

                return "<section class=\"{$classId} lb-applications-section\"{$sectionIdAttr}>
                    <div class=\"lb-section-header-center\">
                        {$badgeEyebrowHtml}
                        <h2 class=\"lb-section-center-heading\">{$renderedTitle}</h2>
                    </div>
                    <div class=\"lb-app-cards-grid\">{$cardsHtml}</div>
                </section>";
            }

            // ── 7. WHY US COMPARISON TABLE ──
            case 'comparison_table': {
                $badge = htmlspecialchars($settings['badge'] ?? 'THE ADVANTAGE');
                $title = $settings['title'] ?? 'Why Industry Leaders Choose Our Solutions';
                $highlight = $settings['highlightWord'] ?? 'Our Solutions';
                $renderedTitle = $this->renderHighlightedText($title, $highlight, '#38bdf8');
                $brandCol = htmlspecialchars($settings['brandColName'] ?? 'Our Platform');
                $compCol = htmlspecialchars($settings['competitorColName'] ?? 'Standard Alternatives');
                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'THE ADVANTAGE'));

                $rows = [];
                if (!empty($settings['rows']) && is_array($settings['rows'])) {
                    foreach ($settings['rows'] as $r) {
                        $rows[] = [
                            'f' => $r['feature'] ?? ($r['feat'] ?? 'Feature'),
                            'us' => $r['us'] ?? '✓ High Performance',
                            'them' => $r['them'] ?? '✗ Subpar Alternative'
                        ];
                    }
                }
                if (empty($rows)) {
                    $rows = [
                        ['f' => $settings['r1Feature'] ?? 'Performance & Speed', 'us' => $settings['r1Us'] ?? '✓ 10x Faster Execution', 'them' => $settings['r1Them'] ?? '✗ Slow and Resource Heavy'],
                        ['f' => $settings['r2Feature'] ?? 'Reliability & Uptime', 'us' => $settings['r2Us'] ?? '✓ 99.99% Guaranteed SLA', 'them' => $settings['r2Them'] ?? '✗ Unpredictable Outages'],
                        ['f' => $settings['r3Feature'] ?? 'Security Compliance', 'us' => $settings['r3Us'] ?? '✓ Enterprise-Grade Encryption', 'them' => $settings['r3Them'] ?? '✗ Basic Protection Only'],
                        ['f' => $settings['r4Feature'] ?? 'Modular Customization', 'us' => $settings['r4Us'] ?? '✓ Fully Adaptable & Modular', 'them' => $settings['r4Them'] ?? '✗ Rigid Legacy Architecture'],
                        ['f' => $settings['r5Feature'] ?? 'Dedicated Support', 'us' => $settings['r5Us'] ?? '✓ 24/7 Priority Support', 'them' => $settings['r5Them'] ?? '✗ Community Forums Only']
                    ];
                }

                $tableRowsHtml = '';
                $checkIcon = $this->renderLucideIcon('check', '', 14, '#10b981');
                $xIcon = $this->renderLucideIcon('x', '', 14, '#f87171');
                foreach ($rows as $r) {
                    $rf = htmlspecialchars($r['f']);
                    $ru = htmlspecialchars($r['us']);
                    $rt = htmlspecialchars($r['them']);

                    $ruClean = preg_replace('/^[✓✔★]\s*/u', '', $ru);
                    $rtClean = preg_replace('/^[✗✕xX]\s*/u', '', $rt);

                    $tableRowsHtml .= "<tr class=\"lb-comp-tr\">
                        <td class=\"lb-comp-td-feat\">{$rf}</td>
                        <td class=\"lb-comp-td-us\"><span class=\"lb-comp-us-pill\">{$checkIcon} <span>{$ruClean}</span></span></td>
                        <td class=\"lb-comp-td-them\"><span class=\"lb-comp-them-pill\">{$xIcon} <span>{$rtClean}</span></span></td>
                    </tr>";
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';
                $starIcon = $this->renderLucideIcon('star', '', 14, '#38bdf8');

                return "<section class=\"{$classId} lb-comparison-section\"{$sectionIdAttr}>
                    <div class=\"lb-section-header-center\">
                        {$badgeEyebrowHtml}
                        <h2 class=\"lb-section-center-heading\">{$renderedTitle}</h2>
                    </div>
                    <div class=\"lb-comp-table-card\">
                        <table class=\"lb-comp-table\">
                            <thead>
                                <tr>
                                    <th class=\"lb-comp-th-feat\">Key Performance Metric</th>
                                    <th class=\"lb-comp-th-us\">{$starIcon} {$brandCol}</th>
                                    <th class=\"lb-comp-th-them\">{$compCol}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {$tableRowsHtml}
                            </tbody>
                        </table>
                    </div>
                </section>";
            }

            // ── 8. TECH INNOVATION CARDS ──
            case 'tech_innovation': {
                $badge = htmlspecialchars($settings['badge'] ?? 'R&D AND ENGINEERING');
                $title = $settings['title'] ?? 'Modern Architecture & Continuous Innovation';
                $highlight = $settings['highlightWord'] ?? 'Continuous Innovation';
                $renderedTitle = $this->renderHighlightedText($title, $highlight, '#38bdf8');
                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'R&D AND ENGINEERING'));

                $techs = [];
                if (!empty($settings['cards']) && is_array($settings['cards'])) {
                    foreach ($settings['cards'] as $c) {
                        $techs[] = [
                            't' => $c['title'] ?? 'Innovation',
                            'tag' => $c['tag'] ?? 'PERFORMANCE',
                            'd' => $c['description'] ?? ($c['desc'] ?? ''),
                            'img' => $c['image'] ?? ($c['img'] ?? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80')
                        ];
                    }
                }
                if (empty($techs)) {
                    $techs = [
                        [
                            't' => $settings['t1Title'] ?? 'Modular Core Engine',
                            'tag' => $settings['t1Tag'] ?? 'PERFORMANCE',
                            'd' => $settings['t1Desc'] ?? '',
                            'img' => $settings['t1Image'] ?? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
                        ],
                        [
                            't' => $settings['t2Title'] ?? 'Automated Quality Control',
                            'tag' => $settings['t2Tag'] ?? 'PRECISION',
                            'd' => $settings['t2Desc'] ?? '',
                            'img' => $settings['t2Image'] ?? 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'
                        ],
                        [
                            't' => $settings['t3Title'] ?? 'Rigorous Stress Testing',
                            'tag' => $settings['t3Tag'] ?? 'VERIFIED',
                            'd' => $settings['t3Desc'] ?? '',
                            'img' => $settings['t3Image'] ?? 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80'
                        ]
                    ];
                }

                $techCardsHtml = '';
                foreach ($techs as $t) {
                    $tTitle = htmlspecialchars($t['t']);
                    $tTag = htmlspecialchars($t['tag']);
                    $tDesc = htmlspecialchars($t['d']);
                    $tImg = htmlspecialchars($this->resolveAssetUrl($t['img']));

                    $techCardsHtml .= "<div class=\"lb-tech-card\">
                        <div class=\"lb-tech-img-wrap\"><img src=\"{$tImg}\" alt=\"{$tTitle}\" class=\"lb-tech-photo\" /></div>
                        <div class=\"lb-tech-card-body\">
                            <div class=\"lb-tech-badge-tag\">{$tTag}</div>
                            <h4 class=\"lb-tech-card-title\">{$tTitle}</h4>
                            <p class=\"lb-tech-card-desc\">{$tDesc}</p>
                        </div>
                    </div>";
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';

                return "<section class=\"{$classId} lb-tech-section\"{$sectionIdAttr}>
                    <div class=\"lb-section-header-center\">
                        {$badgeEyebrowHtml}
                        <h2 class=\"lb-section-center-heading\">{$renderedTitle}</h2>
                    </div>
                    <div class=\"lb-tech-grid\">{$techCardsHtml}</div>
                </section>";
            }

            // ── 9. CONTACT SPLIT SECTION ──
            case 'contact_split': {
                $badge = htmlspecialchars($settings['badge'] ?? 'GET IN TOUCH');
                $title = $settings['title'] ?? 'Connect with Our Sales & Support Team';
                $highlight = $settings['highlightWord'] ?? 'Sales & Support';
                $renderedTitle = $this->renderHighlightedText($title, $highlight, '#38bdf8');
                $email = htmlspecialchars($settings['email'] ?? 'contact@example.com');
                $phone = htmlspecialchars($settings['phone'] ?? '+1 (555) 123-4567');
                $address = htmlspecialchars($settings['address'] ?? '100 Innovation Blvd, Tech District, City');
                $hours = htmlspecialchars($settings['hours'] ?? 'Mon - Fri: 9:00 AM - 6:00 PM');
                $fTitle = htmlspecialchars($settings['formTitle'] ?? 'Request an Instant Quote');
                $fSub = htmlspecialchars($settings['formSubtitle'] ?? 'Fill out your requirements and our team will get back to you promptly.');

                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'GET IN TOUCH'));
                $showInfo = ($settings['showInfoCards'] ?? true) !== false;
                $showForm = ($settings['showLeadForm'] ?? true) !== false;

                $products = explode(',', $settings['productsList'] ?? 'Option 1, Option 2, Option 3, Custom Project');
                $optsHtml = '';
                foreach ($products as $p) {
                    $tp = trim($p);
                    if (!empty($tp)) {
                        $optsHtml .= "<option value=\"" . htmlspecialchars($tp) . "\">" . htmlspecialchars($tp) . "</option>";
                    }
                }

                $infoCardHtml = '';
                if ($showInfo) {
                    $pinIcon = $this->renderLucideIcon('map-pin', '', 18, '#38bdf8');
                    $phoneIcon = $this->renderLucideIcon('phone', '', 18, '#38bdf8');
                    $mailIcon = $this->renderLucideIcon('mail', '', 18, '#38bdf8');
                    $clockIcon = $this->renderLucideIcon('clock', '', 18, '#38bdf8');
                    $infoCardHtml = "<div class=\"lb-contact-info-card\">
                        <div class=\"lb-contact-details-list\">
                            <div class=\"lb-contact-item\"><div class=\"lb-contact-icon\">{$pinIcon}</div><div><div class=\"lb-contact-label\">Office Address</div><div class=\"lb-contact-val\">{$address}</div></div></div>
                            <div class=\"lb-contact-item\"><div class=\"lb-contact-icon\">{$phoneIcon}</div><div><div class=\"lb-contact-label\">Direct Phone</div><div class=\"lb-contact-val\"><a href=\"tel:{$phone}\">{$phone}</a></div></div></div>
                            <div class=\"lb-contact-item\"><div class=\"lb-contact-icon\">{$mailIcon}</div><div><div class=\"lb-contact-label\">Email Inquiries</div><div class=\"lb-contact-val\"><a href=\"mailto:{$email}\">{$email}</a></div></div></div>
                            <div class=\"lb-contact-item\"><div class=\"lb-contact-icon\">{$clockIcon}</div><div><div class=\"lb-contact-label\">Operating Hours</div><div class=\"lb-contact-val\">{$hours}</div></div></div>
                        </div>
                    </div>";
                }

                $formCardHtml = '';
                if ($showForm) {
                    $arrowIcon = $this->renderLucideIcon('arrow-right', '', 14, '#070a0f');
                    $formCardHtml = "<div class=\"lb-contact-form-card\">
                        <h3 class=\"lb-form-title\">{$fTitle}</h3>
                        <p class=\"lb-form-sub\">{$fSub}</p>
                        <form class=\"lb-enquiry-form\" onsubmit=\"event.preventDefault(); alert('Thank you! Your quote request has been received. Our team will contact you shortly.');\">
                            <div class=\"lb-form-row\">
                                <div class=\"lb-form-field\"><label>Full Name *</label><input type=\"text\" required placeholder=\"John Doe\" /></div>
                                <div class=\"lb-form-field\"><label>Phone Number *</label><input type=\"tel\" required placeholder=\"+1 (555) 000-0000\" /></div>
                            </div>
                            <div class=\"lb-form-row\">
                                <div class=\"lb-form-field\"><label>Work Email *</label><input type=\"email\" required placeholder=\"john@example.com\" /></div>
                                <div class=\"lb-form-field\"><label>Category / Product</label><select>{$optsHtml}</select></div>
                            </div>
                            <div class=\"lb-form-field\"><label>Project Requirements *</label><textarea rows=\"3\" required placeholder=\"Describe your project scope or specifications...\"></textarea></div>
                            <button type=\"submit\" class=\"lb-form-submit-btn\">Submit Quote Request {$arrowIcon}</button>
                        </form>
                    </div>";
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';

                return "<section class=\"{$classId} lb-contact-split-section\"{$sectionIdAttr}>
                    <div class=\"lb-section-header-center\">
                        {$badgeEyebrowHtml}
                        <h2 class=\"lb-section-center-heading\">{$renderedTitle}</h2>
                    </div>
                    <div class=\"lb-contact-split-grid\">
                        {$infoCardHtml}
                        {$formCardHtml}
                    </div>
                </section>";
            }

            // ── 10. ENTERPRISE FOOTER ──
            case 'enterprise_footer': {
                $brand = htmlspecialchars($settings['brandName'] ?? 'BrandName');
                $tagline = htmlspecialchars($settings['tagline'] ?? 'Delivering modern, scalable, and high-performance digital solutions worldwide.');
                $col1Title = htmlspecialchars($settings['col1Title'] ?? 'Products');
                $col2Title = htmlspecialchars($settings['col2Title'] ?? 'Quick Links');
                $col3Title = htmlspecialchars($settings['col3Title'] ?? 'Head Office');
                $copy = htmlspecialchars($settings['copyright'] ?? '© 2026 BrandName. All rights reserved.');

                $showSocial = ($settings['showSocialLinks'] ?? true) !== false;
                $showCol1 = ($settings['showCol1'] ?? true) !== false;
                $showCol2 = ($settings['showCol2'] ?? true) !== false;
                $showCol3 = ($settings['showCol3'] ?? true) !== false;
                $showLegal = ($settings['showLegalLinks'] ?? true) !== false;

                $parseLinks = function($str) {
                    $out = '';
                    foreach (explode(',', $str) as $l) {
                        $t = trim($l);
                        if (!empty($t)) {
                            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $t));
                            $out .= "<a href=\"#{$slug}\">" . htmlspecialchars($t) . "</a>";
                        }
                    }
                    return $out;
                };

                $col1Html = $parseLinks($settings['col1Links'] ?? 'Solution A, Solution B, Solution C, Documentation');
                $col2Html = $parseLinks($settings['col2Links'] ?? 'About Us, Applications, Why Us, Technology, Contact');
                
                $infoLines = explode("\n", $settings['col3Info'] ?? "100 Innovation Blvd\nPhone: +1 (555) 123-4567\nEmail: contact@example.com");
                $infoHtml = '';
                foreach ($infoLines as $line) {
                    $tl = trim($line);
                    if (!empty($tl)) {
                        $infoHtml .= "<div>" . htmlspecialchars($tl) . "</div>";
                    }
                }

                $socialIconsHtml = $showSocial ? "<div class=\"lb-footer-social-icons\">
                    <a href=\"#\" class=\"lb-footer-social-link\" aria-label=\"LinkedIn\">" . $this->renderLucideIcon('linkedin', '', 16, '#94a3b8') . "</a>
                    <a href=\"#\" class=\"lb-footer-social-link\" aria-label=\"Twitter\">" . $this->renderLucideIcon('twitter', '', 16, '#94a3b8') . "</a>
                    <a href=\"#\" class=\"lb-footer-social-link\" aria-label=\"Facebook\">" . $this->renderLucideIcon('facebook', '', 16, '#94a3b8') . "</a>
                    <a href=\"#\" class=\"lb-footer-social-link\" aria-label=\"Instagram\">" . $this->renderLucideIcon('instagram', '', 16, '#94a3b8') . "</a>
                    <a href=\"#\" class=\"lb-footer-social-link\" aria-label=\"YouTube\">" . $this->renderLucideIcon('youtube', '', 16, '#94a3b8') . "</a>
                </div>" : '';

                $col1Block = $showCol1 ? "<div class=\"lb-footer-col\"><h5>{$col1Title}</h5><div class=\"lb-footer-links-list\">{$col1Html}</div></div>" : '';
                $col2Block = $showCol2 ? "<div class=\"lb-footer-col\"><h5>{$col2Title}</h5><div class=\"lb-footer-links-list\">{$col2Html}</div></div>" : '';
                $col3Block = $showCol3 ? "<div class=\"lb-footer-col\"><h5>{$col3Title}</h5><div class=\"lb-footer-info-block\">{$infoHtml}</div></div>" : '';

                $legalLinksHtml = $showLegal ? "<div class=\"lb-footer-legal-links\"><a href=\"#\">Privacy Policy</a> · <a href=\"#\">Terms of Service</a></div>" : '';
                $brandZap = $this->renderLucideIcon('zap', '', 20, '#38bdf8');

                return "<footer class=\"{$classId} lb-enterprise-footer\"{$sectionIdAttr}>
                    <div class=\"lb-footer-main-grid\">
                        <div class=\"lb-footer-brand-col\">
                            <div class=\"lb-footer-brand-logo\" style=\"display: inline-flex; align-items: center; gap: 8px;\">{$brandZap} <span>{$brand}</span></div>
                            <p class=\"lb-footer-brand-desc\">{$tagline}</p>
                            {$socialIconsHtml}
                        </div>
                        {$col1Block}
                        {$col2Block}
                        {$col3Block}
                    </div>
                    <div class=\"lb-footer-bottom-bar\">
                        <div>{$copy}</div>
                        {$legalLinksHtml}
                    </div>
                </footer>";
            }

            // ── 11. TESTIMONIAL GRID ──
            case 'testimonial_grid': {
                $badge = htmlspecialchars($settings['badge'] ?? 'CLIENT SUCCESS');
                $title = htmlspecialchars($settings['title'] ?? 'Trusted by Industry Leaders Worldwide');
                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'CLIENT SUCCESS'));
                $showStars = ($settings['showStars'] ?? true) !== false;

                $tests = [];
                if (!empty($settings['reviews']) && is_array($settings['reviews'])) {
                    foreach ($settings['reviews'] as $r) {
                        $tests[] = [
                            'n' => $r['name'] ?? 'Client',
                            'r' => $r['role'] ?? 'Executive',
                            'q' => $r['quote'] ?? 'Outstanding quality.',
                            'p' => $r['photo'] ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                        ];
                    }
                }
                if (empty($tests)) {
                    $tests = [
                        [
                            'n' => $settings['t1Name'] ?? 'Alex Morgan',
                            'r' => $settings['t1Role'] ?? 'Chief Technology Officer',
                            'q' => $settings['t1Quote'] ?? 'The platform dramatically streamlined our deployment pipeline and reduced turnaround time significantly.',
                            'p' => $settings['t1Photo'] ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                        ],
                        [
                            'n' => $settings['t2Name'] ?? 'Sarah Chen',
                            'r' => $settings['t2Role'] ?? 'Head of Product Design',
                            'q' => $settings['t2Quote'] ?? 'Outstanding build quality and pure static code generation. A true game changer for our team.',
                            'p' => $settings['t2Photo'] ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
                        ],
                        [
                            'n' => $settings['t3Name'] ?? 'David Miller',
                            'r' => $settings['t3Role'] ?? 'Managing Director',
                            'q' => $settings['t3Quote'] ?? 'Exceptional reliability and responsive layout controls. Best builder experience on the market.',
                            'p' => $settings['t3Photo'] ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
                        ]
                    ];
                }

                $cardsHtml = '';
                $starIcon = $this->renderLucideIcon('star', '', 15, '#f59e0b');
                $starsRow = "<div class=\"lb-test-stars\" style=\"display: inline-flex; gap: 4px; color: #f59e0b;\">{$starIcon}{$starIcon}{$starIcon}{$starIcon}{$starIcon}</div>";
                foreach ($tests as $t) {
                    $tn = htmlspecialchars($t['n']);
                    $tr = htmlspecialchars($t['r']);
                    $tq = htmlspecialchars($t['q']);
                    $tp = htmlspecialchars($this->resolveAssetUrl($t['p']));
                    $starsHtml = $showStars ? $starsRow : '';

                    $cardsHtml .= "<div class=\"lb-test-card\">
                        {$starsHtml}
                        <p class=\"lb-test-quote\">\"{$tq}\"</p>
                        <div class=\"lb-test-author\">
                            " . (!empty($tp) ? "<img src=\"{$tp}\" alt=\"{$tn}\" class=\"lb-test-avatar\" />" : '') . "
                            <div>
                                <div class=\"lb-test-name\">{$tn}</div>
                                <div class=\"lb-test-role\">{$tr}</div>
                            </div>
                        </div>
                    </div>";
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';

                return "<section class=\"{$classId} lb-testimonial-section\"{$sectionIdAttr}>
                    <div class=\"lb-section-header-center\">
                        {$badgeEyebrowHtml}
                        <h2 class=\"lb-section-center-heading\">{$title}</h2>
                    </div>
                    <div class=\"lb-test-cards-grid\">{$cardsHtml}</div>
                </section>";
            }

            // ── 12. FAQ SECTION ──
            case 'faq_section': {
                $this->hasAccordions = true;
                $badge = htmlspecialchars($settings['badge'] ?? 'FREQUENTLY ASKED');
                $title = htmlspecialchars($settings['title'] ?? 'Frequently Asked Questions');
                $showBadge = ($settings['showBadge'] ?? true) !== false && !empty(trim($settings['badge'] ?? 'FREQUENTLY ASKED'));

                $faqs = [];
                if (!empty($settings['items']) && is_array($settings['items'])) {
                    foreach ($settings['items'] as $f) {
                        $faqs[] = [
                            'q' => $f['question'] ?? ($f['q'] ?? 'Question'),
                            'a' => $f['answer'] ?? ($f['a'] ?? 'Answer')
                        ];
                    }
                }
                if (empty($faqs)) {
                    $faqs = [
                        ['q' => $settings['q1'] ?? 'How do sections and widgets work together?', 'a' => $settings['a1'] ?? 'You can add multiple full-width sections to the canvas, customize each section background and spacing, and place any widgets inside them.'],
                        ['q' => $settings['q2'] ?? 'Can I publish as a single-page landing site?', 'a' => $settings['a2'] ?? 'Yes, LightBuilder compiles your single-page layout into pure static HTML/CSS with smooth anchor scrolling.'],
                        ['q' => $settings['q3'] ?? 'Can I customize individual section colors and backgrounds?', 'a' => $settings['a3'] ?? 'Yes, every section has independent background color, background image, padding, and margin styling.'],
                        ['q' => $settings['q4'] ?? 'Is responsive view supported across devices?', 'a' => $settings['a4'] ?? 'Yes, desktop, tablet, and mobile views are fully supported with responsive layout controls.']
                    ];
                }

                $faqItemsHtml = '';
                $chevronIcon = $this->renderLucideIcon('chevron-down', '', 16, '#38bdf8');
                foreach ($faqs as $idx => $f) {
                    $q = htmlspecialchars($f['q']);
                    $a = htmlspecialchars($f['a']);
                    $isOpen = $idx === 0;
                    $displayStyle = $isOpen ? 'block' : 'none';
                    $rotateStyle = $isOpen ? 'rotate(180deg)' : 'none';

                    $faqItemsHtml .= "<div class=\"lb-accordion-item\">
                        <div class=\"lb-accordion-header\" onclick=\"toggleAccordion(this)\">
                            <span>{$q}</span>
                            <span class=\"lb-accordion-arrow\" style=\"transform: {$rotateStyle};\">{$chevronIcon}</span>
                        </div>
                        <div class=\"lb-accordion-body\" style=\"display: {$displayStyle};\">{$a}</div>
                    </div>";
                }

                $badgeEyebrowHtml = $showBadge ? "<div class=\"lb-section-eyebrow\">{$badge}</div>" : '';

                return "<section class=\"{$classId} lb-faq-section\"{$sectionIdAttr}>
                    <div class=\"lb-section-header-center\">
                        {$badgeEyebrowHtml}
                        <h2 class=\"lb-section-center-heading\">{$title}</h2>
                    </div>
                    <div class=\"lb-faq-list\">{$faqItemsHtml}</div>
                </section>";
            }

            default:
                return '';
        }
    }

    private function generateNodeCss(string $class, string $type, array $s): void {
        switch ($type) {
            case 'section':
            case 'container':
                $pad = $s['padding'] ?? [];
                $mar = $s['margin'] ?? [];
                $bgImg = !empty($s['bgImage']) ? "background-image: url('" . htmlspecialchars($this->resolveAssetUrl($s['bgImage'])) . "'); background-size: " . ($s['bgSize'] ?? 'cover') . "; background-position: " . ($s['bgPosition'] ?? 'center') . ";" : '';
                $bgCol = $s['background'] ?? 'transparent';
                
                $defaultPad = $type === 'section' ? '60px' : '0';
                $defaultSidePad = $type === 'section' ? '24px' : '0';

                $padTop = is_array($pad) ? ($pad['top'] ?? $defaultPad) : $pad;
                $padRight = is_array($pad) ? ($pad['right'] ?? $defaultSidePad) : $pad;
                $padBottom = is_array($pad) ? ($pad['bottom'] ?? $defaultPad) : $pad;
                $padLeft = is_array($pad) ? ($pad['left'] ?? $defaultSidePad) : $pad;

                $marTop = is_array($mar) ? ($mar['top'] ?? '0') : $mar;
                $marRight = is_array($mar) ? ($mar['right'] ?? '0') : $mar;
                $marBottom = is_array($mar) ? ($mar['bottom'] ?? '0') : $mar;
                $marLeft = is_array($mar) ? ($mar['left'] ?? '0') : $mar;

                $css = ".{$class} {
                    display: flex;
                    flex-direction: " . ($s['direction'] ?? 'column') . ";
                    align-items: " . ($s['align'] ?? 'stretch') . ";
                    justify-content: " . ($s['justify'] ?? 'flex-start') . ";
                    flex-wrap: " . ($s['wrap'] ?? 'nowrap') . ";
                    gap: " . ($s['gap'] ?? '0px') . ";
                    padding: {$padTop} {$padRight} {$padBottom} {$padLeft};
                    margin: {$marTop} {$marRight} {$marBottom} {$marLeft};
                    background-color: {$bgCol};
                    {$bgImg}
                    min-height: " . ($s['minHeight'] ?? 'auto') . ";
                    max-width: " . ($s['maxWidth'] ?? '100%') . ";
                    border-radius: " . ($s['borderRadius'] ?? '0px') . ";
                    border: " . ($s['borderWidth'] ?? '1px') . " " . ($s['borderStyle'] ?? 'none') . " " . ($s['borderColor'] ?? 'transparent') . ";
                    box-shadow: " . ($s['boxShadow'] ?? 'none') . ";
                    width: 100%;
                    box-sizing: border-box;
                }";
                $this->cssRules[] = $css;
                break;

            case 'heading':
                $fontSize = is_array($s['fontSize'] ?? null) ? ($s['fontSize']['desktop'] ?? '32px') : ($s['fontSize'] ?? '32px');
                $css = ".{$class} {
                    color: " . ($s['color'] ?? '#ffffff') . ";
                    font-size: {$fontSize};
                    font-weight: " . ($s['fontWeight'] ?? '800') . ";
                    text-align: " . ($s['align'] ?? 'left') . ";
                    line-height: " . ($s['lineHeight'] ?? '1.2') . ";
                    letter-spacing: -0.5px;
                }";
                $this->cssRules[] = $css;
                break;

            case 'text':
                $fontSize = is_array($s['fontSize'] ?? null) ? ($s['fontSize']['desktop'] ?? '16px') : ($s['fontSize'] ?? '16px');
                $css = ".{$class} {
                    color: " . ($s['color'] ?? '#94a3b8') . ";
                    font-size: {$fontSize};
                    line-height: " . ($s['lineHeight'] ?? '1.6') . ";
                    text-align: " . ($s['align'] ?? 'left') . ";
                    max-width: " . ($s['maxWidth'] ?? '100%') . ";
                }";
                $this->cssRules[] = $css;
                break;

            case 'button':
                $variant = $s['variant'] ?? 'primary';
                $bg = $variant === 'primary' ? '#38bdf8' : ($variant === 'secondary' ? 'rgba(255,255,255,0.08)' : 'transparent');
                $color = $variant === 'primary' ? '#070a0f' : '#ffffff';
                $border = $variant === 'outline' ? '1px solid rgba(56,189,248,0.4)' : '1px solid transparent';
                
                $css = ".{$class} {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: {$bg};
                    color: {$color};
                    border: {$border};
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    transition: all 150ms ease;
                }
                .{$class}:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px rgba(56,189,248,0.3);
                }";
                $this->cssRules[] = $css;
                break;

            case 'spacer':
                $this->cssRules[] = ".{$class} { height: " . ($s['height'] ?? '40px') . "; width: 100%; }";
                break;

            case 'divider':
                $this->cssRules[] = ".{$class} { width: 100%; margin: " . ($s['margin'] ?? '0px') . "; } .{$class}-line { border: none; border-top: " . ($s['thickness'] ?? '1px') . " solid " . ($s['color'] ?? 'rgba(255,255,255,0.1)') . "; }";
                break;
        }

        // Common advanced styles for all nodes (margin, padding for non-container, z-index, opacity, border-radius, box-shadow, animation)
        $advCss = [];
        if (!in_array($type, ['section', 'container'])) {
            if (!empty($s['margin'])) {
                if (is_array($s['margin'])) {
                    $mTop = $s['margin']['top'] ?? '0';
                    $mRight = $s['margin']['right'] ?? '0';
                    $mBottom = $s['margin']['bottom'] ?? '0';
                    $mLeft = $s['margin']['left'] ?? '0';
                    $advCss[] = "margin: {$mTop} {$mRight} {$mBottom} {$mLeft};";
                } elseif (is_string($s['margin'])) {
                    $advCss[] = "margin: {$s['margin']};";
                }
            }
            if (!empty($s['padding'])) {
                if (is_array($s['padding'])) {
                    $pTop = $s['padding']['top'] ?? '0';
                    $pRight = $s['padding']['right'] ?? '0';
                    $pBottom = $s['padding']['bottom'] ?? '0';
                    $pLeft = $s['padding']['left'] ?? '0';
                    $advCss[] = "padding: {$pTop} {$pRight} {$pBottom} {$pLeft};";
                } elseif (is_string($s['padding'])) {
                    $advCss[] = "padding: {$s['padding']};";
                }
            }
        }

        if (isset($s['zIndex']) && $s['zIndex'] !== '') {
            $advCss[] = "z-index: {$s['zIndex']}; position: relative;";
        }
        if (isset($s['opacity']) && $s['opacity'] !== '') {
            $advCss[] = "opacity: {$s['opacity']};";
        }
        if (!empty($s['borderRadius']) && !in_array($type, ['section', 'container'])) {
            $advCss[] = "border-radius: {$s['borderRadius']};";
        }
        if (!empty($s['boxShadow']) && $s['boxShadow'] !== 'none' && !in_array($type, ['section', 'container'])) {
            $advCss[] = "box-shadow: {$s['boxShadow']};";
        }
        if (!empty($s['animation']) && $s['animation'] !== 'none') {
            $duration = $s['animationDuration'] ?? '0.6s';
            $advCss[] = "animation: {$s['animation']} {$duration} ease both;";
        }
        if (!empty($s['background']) && $s['background'] !== 'transparent' && !in_array($type, ['section', 'container'])) {
            $advCss[] = "background: {$s['background']} !important;";
        }

        if (!empty($advCss)) {
            $this->cssRules[] = ".{$class} { " . implode(' ', $advCss) . " }";
        }

        // Responsive device visibility
        if (!empty($s['hideOnDesktop'])) {
            $this->cssRules[] = "@media (min-width: 1025px) { .{$class} { display: none !important; } }";
        }
        if (!empty($s['hideOnTablet'])) {
            $this->cssRules[] = "@media (min-width: 768px) and (max-width: 1024px) { .{$class} { display: none !important; } }";
        }
        if (!empty($s['hideOnMobile'])) {
            $this->cssRules[] = "@media (max-width: 767px) { .{$class} { display: none !important; } }";
        }
    }

    private function generateCss(): string {
        $sharedCss = "
        /* Multi-Page Site Navigation Header */
        .lb-site-header {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: rgba(7, 10, 15, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0 24px;
        }
        .lb-site-header-inner {
            max-width: 1200px;
            margin: 0 auto;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .lb-site-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
        }
        .lb-site-logo-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #0284c7, #38bdf8);
            color: #070a0f;
            font-size: 16px;
            font-weight: 900;
        }
        .lb-site-nav {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .lb-nav-link {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #94a3b8;
            transition: all 150ms ease;
        }
        .lb-nav-link:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
        }
        .lb-nav-link.active {
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.12);
        }
        .lb-mobile-nav-toggle {
            display: none;
            background: none;
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
            font-size: 20px;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
        }
        .lb-mobile-nav-menu {
            display: none;
            flex-direction: column;
            padding: 12px 0 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .lb-mobile-nav-link {
            padding: 10px 16px;
            font-size: 15px;
            font-weight: 600;
            color: #94a3b8;
        }
        .lb-mobile-nav-link.active {
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.1);
        }

        @media (max-width: 768px) {
            .lb-site-nav { display: none; }
            .lb-mobile-nav-toggle { display: block; }
        }

        /* Shared Section Eyebrow & Center Headers */
        .lb-section-header-center { text-align: center; margin-bottom: 48px; }
        .lb-section-eyebrow { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
        .lb-section-center-heading { font-size: clamp(26px, 3.5vw, 40px); font-weight: 800; color: #ffffff; line-height: 1.2; letter-spacing: -0.5px; max-width: 800px; margin: 0 auto; }

        /* 1. Navbar Header Widget */
        .lb-navbar-header { position: sticky; top: 0; z-index: 100; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 14px 24px; width: 100%; box-sizing: border-box; }
        .lb-navbar-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 20px; width: 100%; box-sizing: border-box; }
        .lb-navbar-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; min-width: 0; }
        .lb-header-logo-badge { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #38bdf8); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #070a0f; flex-shrink: 0; }
        .lb-header-logo-img { height: 38px; max-height: 48px; max-width: 180px; width: auto; object-fit: contain; display: block; flex-shrink: 0; }
        .lb-header-brand-title { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lb-navbar-links { display: flex; align-items: center; gap: 6px; }
        .lb-header-navlink { padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; color: #cbd5e1; transition: all 150ms ease; }
        .lb-header-navlink:hover { color: #38bdf8; background: rgba(255, 255, 255, 0.05); }
        .lb-navbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .lb-navbar-actions { display: flex; align-items: center; gap: 10px; }
        .lb-navbar-brochure-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; font-size: 13px; font-weight: 600; }
        .lb-navbar-cta-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; background: #38bdf8; color: #070a0f; font-size: 13px; font-weight: 800; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35); white-space: nowrap; }
        .lb-navbar-toggle { display: none; flex-direction: column; justify-content: space-between; width: 32px; height: 26px; background: transparent; border: none; cursor: pointer; padding: 3px 0; }
        .lb-navbar-toggle .lb-bar { width: 100%; height: 2px; background-color: #ffffff; border-radius: 2px; transition: all 200ms ease; }
        .lb-navbar-mobile-drawer { display: none; flex-direction: column; gap: 10px; padding: 16px 0 6px; border-top: 1px solid rgba(255, 255, 255, 0.08); margin-top: 12px; }
        .lb-mobile-navlinks { display: flex; flex-direction: column; gap: 4px; }
        .lb-mobile-navlinks .lb-header-navlink { padding: 10px 14px; background: rgba(255, 255, 255, 0.03); font-size: 14px; }

        @media (max-width: 900px) {
            .lb-navbar-links { display: none; }
            .lb-navbar-toggle { display: flex; }
            .lb-navbar-header.lb-menu-open .lb-navbar-mobile-drawer { display: flex; }
            .lb-navbar-brochure-btn:not(.lb-mobile-only) { display: none; }
            .lb-navbar-header { padding: 12px 16px; }
            .lb-header-logo-img { max-height: 36px; max-width: 140px; }
            .lb-header-brand-title { font-size: 17px; }
            .lb-navbar-cta-btn { padding: 6px 12px; font-size: 12px; }
        }

        @media (max-width: 640px) {
            .lb-navbar-brand { max-width: 55%; }
            .lb-header-logo-img { height: 28px !important; max-height: 30px !important; max-width: 110px !important; }
            .lb-header-brand-title { font-size: 15px; }
            .lb-navbar-cta-btn { padding: 6px 10px; font-size: 11px; }
            .lb-hero-main-title { font-size: 28px !important; }
            .lb-hero-slider { min-height: 100vh !important; min-height: 100dvh !important; padding: 80px 16px 60px !important; }
            .lb-stats-metric-inner { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
            .lb-metric-number { font-size: 28px !important; }
            .lb-comparison-section { padding: 50px 16px !important; }
            .lb-comp-table-card { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; width: 100% !important; max-width: 100% !important; border-radius: 12px !important; }
            .lb-comp-table { min-width: 480px !important; width: 100% !important; }
            .lb-comp-table th, .lb-comp-table td { padding: 12px 14px !important; font-size: 13px !important; }
        }

        /* 2. Hero Slider */
        .lb-hero-slider { position: relative; min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 100px 24px 80px; overflow: hidden; width: 100%; box-sizing: border-box; }
        .lb-hero-bg-layer { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 800ms ease; }
        .lb-hero-bg-layer.active { opacity: 1; }
        .lb-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 10, 15, 0.75) 0%, rgba(7, 10, 15, 0.95) 100%); }
        .lb-hero-content-wrap { position: relative; z-index: 2; max-width: 860px; text-align: center; margin: 0 auto; }
        .lb-hero-tag-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 9999px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 12px; font-weight: 800; letter-spacing: 1px; margin-bottom: 24px; }
        .lb-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; }
        .lb-hero-main-title { font-size: clamp(34px, 5.5vw, 58px); font-weight: 900; color: #ffffff; line-height: 1.15; letter-spacing: -1px; margin-bottom: 20px; }
        .lb-hero-main-desc { font-size: clamp(16px, 2vw, 18px); color: #cbd5e1; line-height: 1.6; max-width: 720px; margin: 0 auto 36px; }
        .lb-hero-btn-row { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
        .lb-hero-primary-btn { display: inline-flex; align-items: center; gap: 8px; background: #38bdf8; color: #070a0f; padding: 14px 30px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.4); }
        .lb-hero-secondary-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.08); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; }
        .lb-hero-slider-controls { position: absolute; bottom: 24px; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 16px; z-index: 3; }
        .lb-hero-arrow { width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .lb-hero-dots { display: flex; gap: 8px; align-items: center; }
        .lb-hero-dot { width: 8px; height: 8px; border-radius: 9999px; background: rgba(255, 255, 255, 0.3); cursor: pointer; transition: all 200ms ease; }
        .lb-hero-dot.active { width: 24px; background: #38bdf8; }

        /* 3. Animated Stats Bar */
        .lb-stats-metric-bar { background: #0f172a; border-top: 1px solid rgba(255, 255, 255, 0.08); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding: 32px 24px; width: 100%; box-sizing: border-box; }
        .lb-stats-metric-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; text-align: center; }
        .lb-metric-col { padding: 12px; }
        .lb-metric-number { font-size: clamp(32px, 4vw, 44px); font-weight: 900; color: #38bdf8; line-height: 1.1; margin-bottom: 6px; }
        .lb-metric-title { font-size: 14px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

        /* 4. About Showcase */
        .lb-about-showcase { max-width: 1200px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-about-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; }
        .lb-about-heading { font-size: clamp(28px, 4vw, 42px); font-weight: 800; color: #ffffff; line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 20px; }
        .lb-about-desc { font-size: 16px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px; }
        .lb-about-chips-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
        .lb-about-badge-chip { padding: 6px 14px; border-radius: 9999px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); font-size: 12px; font-weight: 600; color: #cbd5e1; }
        .lb-about-bullets-list { display: flex; flex-direction: column; gap: 12px; }
        .lb-about-bullet-item { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 600; color: #f1f5f9; }
        .lb-about-check-icon { width: 22px; height: 22px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: #10b981; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; flex-shrink: 0; }
        .lb-about-img-frame { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
        .lb-about-photo { width: 100%; height: auto; display: block; object-fit: cover; }
        .lb-about-cert-card { position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; }
        .lb-about-cert-icon { font-size: 28px; }
        .lb-about-cert-title { font-size: 15px; font-weight: 800; color: #ffffff; }
        .lb-about-cert-sub { font-size: 12px; color: #38bdf8; font-weight: 600; }

        @media (max-width: 900px) {
            .lb-about-grid { grid-template-columns: 1fr; }
        }

        /* 5. Product Tabs Showcase */
        .lb-product-tabs-section { max-width: 1200px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-prod-tabs-nav { display: flex; justify-content: center; gap: 12px; margin-bottom: 36px; flex-wrap: wrap; }
        .lb-prod-tab-btn { padding: 12px 24px; border-radius: 10px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); color: #94a3b8; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 150ms ease; }
        .lb-prod-tab-btn:hover { color: #ffffff; background: rgba(255, 255, 255, 0.08); }
        .lb-prod-tab-btn.active { background: #38bdf8; color: #070a0f; border-color: #38bdf8; box-shadow: 0 4px 16px rgba(56, 189, 248, 0.35); }
        .lb-prod-pane { display: none; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 36px; }
        .lb-prod-pane.active { display: block; }
        .lb-prod-pane-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .lb-prod-img-wrap { border-radius: 14px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); }
        .lb-prod-pane-img { width: 100%; height: 340px; object-fit: cover; }
        .lb-prod-category-tag { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px; }
        .lb-prod-pane-title { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        .lb-prod-pane-desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .lb-prod-specs-table { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
        .lb-prod-spec-row { display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(0, 0, 0, 0.25); border-radius: 6px; font-size: 13px; }
        .lb-spec-label { color: #94a3b8; font-weight: 500; }
        .lb-spec-val { color: #f1f5f9; font-weight: 700; }
        .lb-prod-quote-btn { display: inline-flex; align-items: center; gap: 8px; background: #38bdf8; color: #070a0f; padding: 12px 24px; border-radius: 8px; font-weight: 800; font-size: 14px; }

        @media (max-width: 900px) {
            .lb-prod-pane-grid { grid-template-columns: 1fr; }
            .lb-prod-pane-img { height: 240px; }
        }

        /* 6. Applications Grid */
        .lb-applications-section { max-width: 1200px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-app-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .lb-app-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; transition: transform 200ms ease; }
        .lb-app-card:hover { transform: translateY(-4px); }
        .lb-app-img-wrap { height: 200px; overflow: hidden; }
        .lb-app-photo { width: 100%; height: 100%; object-fit: cover; transition: transform 400ms ease; }
        .lb-app-card:hover .lb-app-photo { transform: scale(1.05); }
        .lb-app-card-body { padding: 24px; }
        .lb-app-card-title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
        .lb-app-card-desc { font-size: 14px; color: #94a3b8; line-height: 1.6; }

        /* 7. Comparison Table */
        .lb-comparison-section { max-width: 1000px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-comp-table-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; box-sizing: border-box; }
        .lb-comp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .lb-comp-table th { padding: 18px 24px; font-size: 14px; font-weight: 800; border-bottom: 1px solid rgba(255, 255, 255, 0.1); white-space: nowrap; }
        .lb-comp-th-feat { color: #94a3b8; width: 38%; }
        .lb-comp-th-us { color: #38bdf8; background: rgba(56, 189, 248, 0.08); width: 34%; }
        .lb-comp-th-them { color: #cbd5e1; width: 28%; }
        .lb-comp-tr { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .lb-comp-table td { padding: 16px 24px; font-size: 14px; vertical-align: middle; }
        .lb-comp-td-feat { color: #f1f5f9; font-weight: 600; }
        .lb-comp-td-us { background: rgba(56, 189, 248, 0.04); }
        .lb-comp-us-pill { color: #10b981; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
        .lb-comp-them-pill { color: #f87171; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }

        /* 8. Tech Innovation Section */
        .lb-tech-section { max-width: 1200px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-tech-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .lb-tech-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; }
        .lb-tech-img-wrap { height: 190px; overflow: hidden; }
        .lb-tech-photo { width: 100%; height: 100%; object-fit: cover; }
        .lb-tech-card-body { padding: 24px; }
        .lb-tech-badge-tag { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: #38bdf8; margin-bottom: 8px; text-transform: uppercase; }
        .lb-tech-card-title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
        .lb-tech-card-desc { font-size: 14px; color: #94a3b8; line-height: 1.6; }

        /* 9. Contact Split Section */
        .lb-contact-split-section { max-width: 1200px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-contact-split-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; align-items: start; }
        .lb-contact-info-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 36px; }
        .lb-contact-info-title { font-size: clamp(24px, 3.5vw, 36px); font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 14px; }
        .lb-contact-info-sub { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
        .lb-contact-details-list { display: flex; flex-direction: column; gap: 18px; }
        .lb-contact-item { display: flex; gap: 14px; align-items: flex-start; }
        .lb-contact-icon { font-size: 20px; color: #38bdf8; flex-shrink: 0; }
        .lb-contact-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .lb-contact-val { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-top: 2px; }
        .lb-contact-form-card { background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 36px; }
        .lb-form-title { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 6px; }
        .lb-form-sub { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
        .lb-enquiry-form { display: flex; flex-direction: column; gap: 16px; }
        .lb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .lb-form-field label { display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; }
        .lb-form-field input, .lb-form-field select, .lb-form-field textarea { width: 100%; padding: 10px 14px; border-radius: 8px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; font-size: 13px; box-sizing: border-box; }
        .lb-form-submit-btn { background: #38bdf8; color: #070a0f; font-weight: 800; padding: 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; margin-top: 6px; box-shadow: 0 4px 16px rgba(56, 189, 248, 0.35); }

        @media (max-width: 900px) {
            .lb-contact-split-grid { grid-template-columns: 1fr; }
            .lb-form-row { grid-template-columns: 1fr; }
        }

        /* 10. Enterprise Footer */
        .lb-enterprise-footer { background: #05080c; border-top: 1px solid rgba(255, 255, 255, 0.08); padding: 60px 24px 32px; width: 100%; box-sizing: border-box; margin-top: 0px; }
        .lb-footer-main-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap: 36px; margin-bottom: 48px; }
        .lb-footer-brand-logo { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        .lb-footer-brand-desc { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 18px; }
        .lb-footer-social-icons { display: flex; gap: 10px; }
        .lb-footer-social-link { width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .lb-footer-col h5 { font-size: 14px; font-weight: 800; color: #ffffff; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
        .lb-footer-links-list { display: flex; flex-direction: column; gap: 10px; }
        .lb-footer-links-list a { font-size: 13px; color: #94a3b8; transition: color 150ms ease; }
        .lb-footer-links-list a:hover { color: #38bdf8; }
        .lb-footer-info-block { font-size: 13px; color: #94a3b8; line-height: 1.8; }
        .lb-footer-bottom-bar { max-width: 1200px; margin: 0 auto; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.06); display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; flex-wrap: wrap; gap: 12px; }
        .lb-footer-legal-links a { color: #64748b; }
        .lb-footer-legal-links a:hover { color: #94a3b8; }

        @media (max-width: 900px) {
            .lb-footer-main-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 500px) {
            .lb-footer-main-grid { grid-template-columns: 1fr; }
        }

        /* 11. Testimonials Grid */
        .lb-testimonial-section { max-width: 1200px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-test-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .lb-test-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
        .lb-test-stars { color: #f59e0b; font-size: 16px; }
        .lb-test-quote { color: #e2e8f0; font-size: 14px; line-height: 1.7; font-style: italic; }
        .lb-test-author { display: flex; align-items: center; gap: 12px; }
        .lb-test-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(56, 189, 248, 0.4); }
        .lb-test-name { font-size: 14px; font-weight: 700; color: #ffffff; }
        .lb-test-role { font-size: 12px; color: #94a3b8; }

        /* 12. FAQ Section */
        .lb-faq-section { max-width: 860px; margin: 0 auto; padding: 80px 24px; width: 100%; box-sizing: border-box; }
        .lb-faq-list { display: flex; flex-direction: column; gap: 12px; }
        .lb-accordion-item { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; overflow: hidden; }
        .lb-accordion-header { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 15px; color: #f1f5f9; }
        .lb-accordion-arrow { font-size: 12px; color: #38bdf8; transition: transform 200ms ease; }
        .lb-accordion-body { padding: 0 20px 18px; color: #94a3b8; font-size: 14px; line-height: 1.6; }

        /* Map Embed */
        .lb-map-wrap { width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); }
        .lb-map-wrap iframe { width: 100%; height: 100%; border: 0; }

        /* Code Block */
        .lb-code-wrap { background: #0c121e; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; width: 100%; font-family: 'JetBrains Mono', monospace; }
        .lb-code-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
        .lb-code-file { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; }
        .lb-code-file span { width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; }
        .lb-code-lang { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; }
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        ";

        return $sharedCss . "\n" . implode("\n", $this->cssRules);
    }

    private function generateJs(): string {
        $js = "<script>\n";

        if ($this->hasNav) {
            $js .= "function toggleMobileNav(btn) {
                var menu = btn.closest('.lb-site-header').querySelector('.lb-mobile-nav-menu');
                var isShown = menu.style.display === 'flex';
                menu.style.display = isShown ? 'none' : 'flex';
            }\n";
        }
        
        if ($this->hasAccordions) {
            $js .= "function toggleAccordion(header) {
                var body = header.nextElementSibling;
                var arrow = header.querySelector('.lb-accordion-arrow');
                var isOpen = body.style.display === 'block';
                body.style.display = isOpen ? 'none' : 'block';
                if (arrow) {
                    arrow.style.transform = isOpen ? 'none' : 'rotate(180deg)';
                }
            }\n";
        }

        if ($this->hasTabs) {
            $js .= "function switchProdTab(btn, containerClass, index) {
                var container = btn.closest('.' + containerClass);
                if (!container) return;
                container.querySelectorAll('.lb-prod-tab-btn').forEach(function(b) { b.classList.remove('active'); });
                container.querySelectorAll('.lb-prod-pane').forEach(function(p) { p.classList.remove('active'); });
                btn.classList.add('active');
                var targetPane = container.querySelector('.lb-prod-pane[data-pane=\"' + index + '\"]');
                if (targetPane) targetPane.classList.add('active');
            }\n";
        }

        if ($this->hasSliders) {
            $js .= "function changeHeroSlide(containerClass, direction) {
                var container = document.querySelector('.' + containerClass);
                if (!container) return;
                var slides = container.querySelectorAll('.lb-hero-slide');
                var dots = container.querySelectorAll('.lb-hero-dot');
                var activeIndex = 0;
                slides.forEach(function(s, idx) {
                    if (s.classList.contains('active')) activeIndex = idx;
                });
                var newIndex = (activeIndex + direction + slides.length) % slides.length;
                goToHeroSlide(containerClass, newIndex);
            }
            function goToHeroSlide(containerClass, index) {
                var container = document.querySelector('.' + containerClass);
                if (!container) return;
                var slides = container.querySelectorAll('.lb-hero-slide');
                var dots = container.querySelectorAll('.lb-hero-dot');
                slides.forEach(function(s, idx) {
                    if (idx === index) s.classList.add('active');
                    else s.classList.remove('active');
                });
                dots.forEach(function(d, idx) {
                    if (idx === index) d.classList.add('active');
                    else d.classList.remove('active');
                });
            }\n";
        }

        $js .= "if (window.lucide) { lucide.createIcons(); } else { document.addEventListener('DOMContentLoaded', function() { if (window.lucide) lucide.createIcons(); }); }\n";
        $js .= "</script>\n<script src=\"https://unpkg.com/lucide@latest\"></script>\n<script>document.addEventListener('DOMContentLoaded', function(){ if (window.lucide) lucide.createIcons(); });</script>";
        return $js;
    }
}
