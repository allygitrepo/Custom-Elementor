<?php
/**
 * LightBuilder - High-Performance Static HTML/CSS Compiler
 */

namespace LightBuilder\Renderer;

class HtmlCompiler {
    private array $cssRules = [];
    private bool $hasAccordions = false;
    private bool $hasTabs = false;
    private bool $hasCounters = false;
    private bool $hasNav = false;

    public function compilePage(array $page, array $website = []): string {
        $this->cssRules = [];
        $this->hasAccordions = false;
        $this->hasTabs = false;
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

        // Render site navigation header if website has pages
        $navHtml = '';
        $pages = $website['pages'] ?? [];
        if (!empty($pages)) {
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
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        /* Base Reset & Typography */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: #0b0f17;
            color: #f8fafc;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }
        img { max-width: 100%; height: auto; display: block; }
        a { color: inherit; text-decoration: none; }
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

        return <<<HTML
<header class="lb-site-header">
    <div class="lb-site-header-inner">
        <a href="index.html" class="lb-site-logo">
            <span class="lb-site-logo-icon">⚡</span>
            <span class="lb-site-logo-text">{$siteName}</span>
        </a>
        <nav class="lb-site-nav">
            {$linksHtml}
        </nav>
        <button class="lb-mobile-nav-toggle" aria-label="Toggle navigation menu" onclick="toggleMobileNav(this)">☰</button>
    </div>
    <div class="lb-mobile-nav-menu" id="lbMobileMenu" style="display: none;">
        {$mobileLinksHtml}
    </div>
</header>
HTML;
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

        switch ($type) {
            case 'container':
                $innerHtml = '';
                foreach ($children as $child) {
                    $innerHtml .= $this->renderNode($child);
                }
                return "<div class=\"{$classId}\">{$innerHtml}</div>";

            case 'heading':
                $tag = in_array($settings['tag'] ?? 'h2', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span']) ? $settings['tag'] : 'h2';
                $text = $settings['text'] ?? 'Heading';
                return "<{$tag} class=\"{$classId}\">{$text}</{$tag}>";

            case 'text':
                $text = $settings['text'] ?? '<p>Paragraph text</p>';
                return "<div class=\"{$classId}\">{$text}</div>";

            case 'image':
                $url = htmlspecialchars($settings['url'] ?? '');
                $alt = htmlspecialchars($settings['alt'] ?? 'Image');
                $link = $settings['linkUrl'] ?? '';
                $imgTag = "<img src=\"{$url}\" alt=\"{$alt}\" class=\"{$classId}-img\" />";
                if (!empty($link)) {
                    $imgTag = "<a href=\"" . htmlspecialchars($link) . "\">{$imgTag}</a>";
                }
                return "<div class=\"{$classId}\">{$imgTag}</div>";

            case 'button':
                $text = htmlspecialchars($settings['text'] ?? 'Click Here');
                $url = htmlspecialchars($settings['url'] ?? '#');
                $target = htmlspecialchars($settings['target'] ?? '_self');
                return "<div class=\"{$classId}-wrap\"><a href=\"{$url}\" target=\"{$target}\" class=\"{$classId}\">{$text}</a></div>";

            case 'spacer':
                return "<div class=\"{$classId}\"></div>";

            case 'divider':
                return "<div class=\"{$classId}\"><hr class=\"{$classId}-line\" /></div>";

            case 'iconbox':
                $title = htmlspecialchars($settings['title'] ?? 'Feature Title');
                $desc = htmlspecialchars($settings['description'] ?? '');
                return "<div class=\"{$classId}\">
                    <div class=\"{$classId}-icon\">⚡</div>
                    <h3 class=\"{$classId}-title\">{$title}</h3>
                    <p class=\"{$classId}-desc\">{$desc}</p>
                </div>";

            case 'video':
                $url = htmlspecialchars($settings['url'] ?? '');
                return "<div class=\"{$classId}\"><iframe src=\"{$url}\" frameborder=\"0\" allowfullscreen></iframe></div>";

            case 'accordion':
                $this->hasAccordions = true;
                $items = $settings['items'] ?? [];
                $accHtml = '';
                foreach ($items as $idx => $item) {
                    $itemTitle = htmlspecialchars($item['title'] ?? '');
                    $itemContent = $item['content'] ?? '';
                    $accHtml .= "<div class=\"lb-accordion-item\">
                        <div class=\"lb-accordion-header\" onclick=\"toggleAccordion(this)\">
                            <span>{$itemTitle}</span>
                            <span class=\"lb-accordion-arrow\">▼</span>
                        </div>
                        <div class=\"lb-accordion-body\" style=\"display: " . ($idx === 0 ? 'block' : 'none') . "\">
                            {$itemContent}
                        </div>
                    </div>";
                }
                return "<div class=\"{$classId}\">{$accHtml}</div>";

            case 'tabs':
                $this->hasTabs = true;
                $tabs = $settings['tabs'] ?? [];
                $tabButtons = '';
                $tabContents = '';
                foreach ($tabs as $idx => $tab) {
                    $activeClass = $idx === 0 ? 'active' : '';
                    $tabTitle = htmlspecialchars($tab['title'] ?? '');
                    $tabContent = $tab['content'] ?? '';
                    $tabButtons .= "<button class=\"lb-tab-btn {$activeClass}\" onclick=\"switchTab(this, '{$classId}', {$idx})\">{$tabTitle}</button>";
                    $tabContents .= "<div class=\"lb-tab-pane {$activeClass}\" data-pane=\"{$idx}\">{$tabContent}</div>";
                }
                return "<div class=\"{$classId} lb-tabs-container\">
                    <div class=\"lb-tab-nav\">{$tabButtons}</div>
                    <div class=\"lb-tab-content\">{$tabContents}</div>
                </div>";

            case 'counter':
                $this->hasCounters = true;
                $num = htmlspecialchars($settings['number'] ?? '100');
                $prefix = htmlspecialchars($settings['prefix'] ?? '');
                $suffix = htmlspecialchars($settings['suffix'] ?? '');
                $label = htmlspecialchars($settings['label'] ?? '');
                return "<div class=\"{$classId}\">
                    <div class=\"{$classId}-number lb-counter-num\" data-target=\"{$num}\">{$prefix}{$num}{$suffix}</div>
                    " . (!empty($label) ? "<div class=\"{$classId}-label\">{$label}</div>" : '') . "
                </div>";

            case 'progress':
                $pct = min(100, max(0, (int)($settings['percent'] ?? 0)));
                $label = htmlspecialchars($settings['label'] ?? '');
                return "<div class=\"{$classId}\">
                    " . (!empty($label) ? "<div class=\"{$classId}-label-wrap\"><span>{$label}</span><span>{$pct}%</span></div>" : '') . "
                    <div class=\"{$classId}-track\"><div class=\"{$classId}-bar\" style=\"width: {$pct}%;\"></div></div>
                </div>";

            case 'testimonial':
                $name = htmlspecialchars($settings['name'] ?? 'Author');
                $role = htmlspecialchars($settings['role'] ?? '');
                $quote = htmlspecialchars($settings['quote'] ?? '');
                $photo = htmlspecialchars($settings['photo'] ?? '');
                return "<div class=\"{$classId}\">
                    <div class=\"{$classId}-stars\">★★★★★</div>
                    <p class=\"{$classId}-quote\">{$quote}</p>
                    <div class=\"{$classId}-author\">
                        " . (!empty($photo) ? "<img src=\"{$photo}\" class=\"{$classId}-avatar\" />" : '') . "
                        <div>
                            <div class=\"{$classId}-name\">{$name}</div>
                            <div class=\"{$classId}-role\">{$role}</div>
                        </div>
                    </div>
                </div>";

            case 'alert':
                $title = htmlspecialchars($settings['title'] ?? '');
                $msg = htmlspecialchars($settings['message'] ?? '');
                return "<div class=\"{$classId} lb-alert-{$settings['type']}\">
                    " . (!empty($title) ? "<strong>{$title}</strong> " : '') . "
                    <span>{$msg}</span>
                </div>";

            case 'html':
                return $settings['code'] ?? '';

            default:
                return '';
        }
    }

    private function generateNodeCss(string $class, string $type, array $s): void {
        switch ($type) {
            case 'container':
                $pad = $s['padding'] ?? [];
                $mar = $s['margin'] ?? [];
                $css = ".{$class} {
                    display: flex;
                    flex-direction: " . ($s['direction'] ?? 'column') . ";
                    align-items: " . ($s['align'] ?? 'stretch') . ";
                    justify-content: " . ($s['justify'] ?? 'flex-start') . ";
                    flex-wrap: " . ($s['wrap'] ?? 'nowrap') . ";
                    gap: " . ($s['gap'] ?? '16px') . ";
                    padding: " . ($pad['top'] ?? '0') . " " . ($pad['right'] ?? '0') . " " . ($pad['bottom'] ?? '0') . " " . ($pad['left'] ?? '0') . ";
                    margin: " . ($mar['top'] ?? '0') . " " . ($mar['right'] ?? '0') . " " . ($mar['bottom'] ?? '0') . " " . ($mar['left'] ?? '0') . ";
                    background: " . ($s['background'] ?? 'transparent') . ";
                    min-height: " . ($s['minHeight'] ?? 'auto') . ";
                    max-width: " . ($s['maxWidth'] ?? '100%') . ";
                    border-radius: " . ($s['borderRadius'] ?? '0px') . ";
                    border: " . ($s['borderWidth'] ?? '1px') . " " . ($s['borderStyle'] ?? 'none') . " " . ($s['borderColor'] ?? 'transparent') . ";
                    box-shadow: " . ($s['boxShadow'] ?? 'none') . ";
                    width: 100%;
                }";
                $this->cssRules[] = $css;
                break;

            case 'heading':
                $fontSize = is_array($s['fontSize'] ?? null) ? ($s['fontSize']['desktop'] ?? '32px') : ($s['fontSize'] ?? '32px');
                $css = ".{$class} {
                    color: " . ($s['color'] ?? '#ffffff') . ";
                    font-size: {$fontSize};
                    font-weight: " . ($s['fontWeight'] ?? '700') . ";
                    text-align: " . ($s['align'] ?? 'left') . ";
                    line-height: " . ($s['lineHeight'] ?? '1.2') . ";
                    letter-spacing: " . ($s['letterSpacing'] ?? '0px') . ";
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
                $pad = $s['padding'] ?? [];
                $css = ".{$class} {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: " . ($s['background'] ?? '#38bdf8') . ";
                    color: " . ($s['textColor'] ?? '#0f172a') . ";
                    padding: " . ($pad['top'] ?? '12px') . " " . ($pad['right'] ?? '24px') . " " . ($pad['bottom'] ?? '12px') . " " . ($pad['left'] ?? '24px') . ";
                    border-radius: " . ($s['borderRadius'] ?? '8px') . ";
                    font-size: " . ($s['fontSize'] ?? '14px') . ";
                    font-weight: " . ($s['fontWeight'] ?? '600') . ";
                    transition: all 150ms ease;
                }
                .{$class}:hover {
                    background: " . ($s['hoverBackground'] ?? '#0ea5e9') . ";
                    color: " . ($s['hoverTextColor'] ?? '#0f172a') . ";
                }";
                $this->cssRules[] = $css;
                break;

            case 'spacer':
                $this->cssRules[] = ".{$class} { height: " . ($s['height'] ?? '40px') . "; width: 100%; }";
                break;

            case 'video':
                $this->cssRules[] = ".{$class} { position: relative; width: 100%; aspect-ratio: " . ($s['aspectRatio'] ?? '16/9') . "; border-radius: " . ($s['borderRadius'] ?? '8px') . "; overflow: hidden; } .{$class} iframe { width: 100%; height: 100%; }";
                break;

            case 'iconbox':
                $this->cssRules[] = ".{$class} { background: " . ($s['background'] ?? 'rgba(255,255,255,0.03)') . "; border-radius: " . ($s['borderRadius'] ?? '12px') . "; padding: 24px 20px; text-align: " . ($s['align'] ?? 'center') . "; border: 1px solid rgba(255,255,255,0.08); }
                .{$class}-icon { font-size: 32px; color: " . ($s['iconColor'] ?? '#38bdf8') . "; margin-bottom: 12px; }
                .{$class}-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
                .{$class}-desc { color: #94a3b8; font-size: 14px; line-height: 1.6; }";
                break;

            case 'testimonial':
                $this->cssRules[] = ".{$class} { background: " . ($s['background'] ?? 'rgba(255,255,255,0.03)') . "; border-radius: " . ($s['borderRadius'] ?? '12px') . "; padding: 24px; border: 1px solid rgba(255,255,255,0.08); }
                .{$class}-stars { color: #f59e0b; margin-bottom: 12px; }
                .{$class}-quote { font-style: italic; color: #e2e8f0; font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
                .{$class}-author { display: flex; align-items: center; gap: 12px; }
                .{$class}-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
                .{$class}-name { font-weight: 700; color: #fff; font-size: 14px; }
                .{$class}-role { color: #94a3b8; font-size: 12px; }";
                break;
        }
    }

    private function generateCss(): string {
        $sharedCss = "
        /* Site Navigation Header */
        .lb-site-header {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: rgba(11, 15, 23, 0.85);
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
            color: #0f172a;
            font-size: 16px;
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

        .lb-accordion-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
        .lb-accordion-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 600; }
        .lb-accordion-body { padding: 0 18px 16px; color: #94a3b8; font-size: 14px; line-height: 1.6; }
        
        .lb-tabs-container { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; }
        .lb-tab-nav { display: flex; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .lb-tab-btn { padding: 12px 20px; background: transparent; color: #94a3b8; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 600; }
        .lb-tab-btn.active { color: #38bdf8; border-bottom-color: #38bdf8; background: rgba(56,189,248,0.1); }
        .lb-tab-pane { display: none; padding: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.6; }
        .lb-tab-pane.active { display: block; }
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
                var isOpen = body.style.display === 'block';
                body.style.display = isOpen ? 'none' : 'block';
                header.querySelector('.lb-accordion-arrow').style.transform = isOpen ? 'none' : 'rotate(180deg)';
            }\n";
        }

        if ($this->hasTabs) {
            $js .= "function switchTab(btn, containerClass, index) {
                var container = btn.closest('.' + containerClass);
                container.querySelectorAll('.lb-tab-btn').forEach(function(b) { b.classList.remove('active'); });
                container.querySelectorAll('.lb-tab-pane').forEach(function(p) { p.classList.remove('active'); });
                btn.classList.add('active');
                container.querySelector('.lb-tab-pane[data-pane=\"' + index + '\"]').classList.add('active');
            }\n";
        }

        $js .= "</script>";
        return $js;
    }
}
