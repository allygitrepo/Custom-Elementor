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
            $dbTemplates = $stmt->fetchAll() ?: [];

            $starterTemplates = $this->getStarterTemplates();
            $startersList = array_map(function($s) {
                return [
                    'id' => $s['id'],
                    'name' => $s['name'],
                    'category' => $s['category'],
                    'thumbnail' => $s['thumbnail'] ?? '',
                    'description' => $s['description'] ?? '',
                    'created_at' => $s['created_at'] ?? null,
                    'is_starter' => true
                ];
            }, $starterTemplates);

            // Merge starters with custom user templates
            $allTemplates = array_merge($startersList, $dbTemplates);

            Response::json($allTemplates);
        } catch (Exception $e) {
            Response::error('Failed to fetch templates: ' . $e->getMessage(), 500);
        }
    }

    public function show(array $params = [], ?array $body = null): void {
        AuthMiddleware::requireAuth();
        $id = (int)($params['id'] ?? 0);

        try {
            $template = null;
            
            // Check starter templates first
            $starters = $this->getStarterTemplates();
            foreach ($starters as $s) {
                if ($s['id'] === $id) {
                    $template = $s;
                    break;
                }
            }

            if (!$template) {
                $db = Database::getConnection();
                $stmt = $db->prepare("SELECT * FROM templates WHERE id = ?");
                $stmt->execute([$id]);
                $template = $stmt->fetch();
            }

            if (!$template) {
                Response::notFound('Template not found');
            }

            if (!empty($template['content_json']) && is_string($template['content_json'])) {
                $template['content'] = json_decode($template['content_json'], true);
            } elseif (!empty($template['content']) && is_array($template['content'])) {
                $template['content'] = $template['content'];
            } else {
                $template['content'] = null;
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

    public function getStarterTemplates(): array {
        return [
            // ── 1. IRONPULSE ELITE GYM & FITNESS ──
            [
                'id' => 901,
                'name' => 'IronPulse Elite Gym & Fitness',
                'category' => 'Fitness & Gym',
                'thumbnail' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
                'description' => 'High-energy 24/7 gym & athletic performance club template with class programs, master trainer showcases, pricing comparisons, and free pass claim form.',
                'content_json' => json_encode([
                    'id' => 'root',
                    'type' => 'container',
                    'settings' => [
                        'direction' => 'column',
                        'padding' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'margin' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'gap' => '0px',
                        'background' => '#0c0908',
                        'minHeight' => '100vh'
                    ],
                    'children' => [
                        [
                            'id' => 'gym_nav_' . uniqid(),
                            'type' => 'nav_header',
                            'settings' => [
                                'brandName' => 'IRONPULSE FITNESS',
                                'showBrandText' => true,
                                'logoUrl' => '',
                                'links' => 'About, Programs, Trainers, Why Us, FAQ, Contact',
                                'catalogText' => 'Class Schedule',
                                'catalogUrl' => '#programs',
                                'showCatalogBtn' => true,
                                'ctaText' => 'Join Now →',
                                'ctaUrl' => '#contact',
                                'showCtaBtn' => true,
                                'isSticky' => true,
                                'background' => 'rgba(20, 13, 10, 0.94)'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_hero_' . uniqid(),
                            'type' => 'hero_slider',
                            'settings' => [
                                'sectionId' => 'home',
                                'tag' => 'PREMIUM 24/7 FITNESS & STRENGTH CLUB',
                                'showTag' => true,
                                'title' => 'Transform Your Body, Unleash Your Potential',
                                'italicWords' => 'Unleash Your Potential',
                                'description' => 'State-of-the-art biomechanical equipment, certified elite personal coaches, and Olympic lifting zones engineered for maximum performance.',
                                'showDescription' => true,
                                'primaryBtnText' => 'Claim 3-Day Free Pass',
                                'primaryBtnUrl' => '#contact',
                                'showPrimaryBtn' => true,
                                'secondaryBtnText' => 'Explore Memberships',
                                'secondaryBtnUrl' => '#programs',
                                'showSecondaryBtn' => true,
                                'showSlideControls' => true,
                                'slide1Image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80',
                                'slide2Image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
                                'slide3Image' => 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=80'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_stats_' . uniqid(),
                            'type' => 'animated_stats_bar',
                            'settings' => [
                                'background' => '#150d0a',
                                's1Num' => '15,000+',
                                's1Label' => 'Active Members',
                                's2Num' => '50+',
                                's2Label' => 'Certified Master Coaches',
                                's3Num' => '120+',
                                's3Label' => 'Weekly Group Classes',
                                's4Num' => '24/7',
                                's4Label' => 'Keycard Access & Security'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_about_' . uniqid(),
                            'type' => 'about_showcase',
                            'settings' => [
                                'sectionId' => 'about',
                                'badge' => 'ENGINEERED FOR ELITE ATHLETES',
                                'showBadge' => true,
                                'title' => 'Next-Level Facilities Built for Serious Results',
                                'highlightWord' => 'Serious Results',
                                'description' => 'Whether your focus is powerlifting, functional HIIT, athletic conditioning, or hypertrophy, our 25,000 sq.ft facility delivers unmatched equipment quality, Olympic platforms, and post-workout recovery suites.',
                                'techBadges' => 'Hammer Strength Center, Eleiko Competition Plates, Cryotherapy & Infrared Saunas, InBody BioSignature Lab',
                                'showTechBadges' => true,
                                'h1' => 'Olympic lifting platforms with calibrated competition plates',
                                'h2' => 'Dedicated cardio theatre with real-time biometric tracking',
                                'h3' => 'Infrared saunas, cold plunge tubs & hydro-massage lounges',
                                'h4' => 'Complimentary premium towel service & organic smoothie bar',
                                'showBullets' => true,
                                'imageUrl' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1000&q=80',
                                'badgeCardTitle' => 'Hammer Strength Official Facility',
                                'badgeCardSubtitle' => 'Eleiko Certified Club Partner',
                                'showBadgeCard' => true,
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_programs_' . uniqid(),
                            'type' => 'product_tabs_showcase',
                            'settings' => [
                                'sectionId' => 'programs',
                                'badge' => 'TRAINING PROGRAMS',
                                'showBadge' => true,
                                'title' => 'World-Class Training Tailored to Your Ambition',
                                'highlightWord' => 'Your Ambition',
                                'p1Tab' => 'Hypertrophy & Strength',
                                'p1Title' => 'Progressive Overload & Strength Mastery',
                                'p1Desc' => 'Structured compound lifting protocols designed by CSCS coaches to safely maximize lean muscle density and raw power.',
                                'p1Image' => 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
                                'p1SpecCore' => 'Hypertrophy & Raw Strength',
                                'p1SpecBarb' => '60-Minute Guided Protocol',
                                'p1SpecCoating' => 'Eleiko Platforms & Dumbbells up to 150 lbs',
                                'p1SpecTensile' => '1:1 Coaching or Small Group (Max 4 Lifters)',
                                'p2Tab' => 'High-Intensity HIIT',
                                'p2Title' => 'Metabolic Conditioning & Caloric Burn',
                                'p2Desc' => 'Heart-rate tracked interval circuits that scorch up to 900 calories per session while boosting athletic cardiovascular endurance.',
                                'p2Image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
                                'p2SpecCore' => 'Fat Oxidation & VO2 Max Boost',
                                'p2SpecBarb' => '45-Minute High-Tempo Circuit',
                                'p2SpecCoating' => 'Assault AirBikes, SkiErgs & Plyo Towers',
                                'p2SpecTensile' => 'Group Format with Live Heart Rate Monitors',
                                'p3Tab' => 'Mobility & Recovery',
                                'p3Title' => 'Athletic Longevity & Postural Alignment',
                                'p3Desc' => 'Myofascial release, dynamic stretch therapy, and cold plunge immersion to accelerate recovery and eliminate joint fatigue.',
                                'p3Image' => 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
                                'p3SpecCore' => 'Injury Prevention & Joint Decompression',
                                'p3SpecBarb' => '50-Minute Specialist Session',
                                'p3SpecCoating' => 'Normatec Compression, Cryo & Infrared Sauna',
                                'p3SpecTensile' => 'Certified Physical Recovery Specialists',
                                'showDatasheetBtn' => true,
                                'showSpecsTable' => true,
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_compare_' . uniqid(),
                            'type' => 'comparison_table',
                            'settings' => [
                                'sectionId' => 'whyus',
                                'badge' => 'THE IRONPULSE STANDARD',
                                'showBadge' => true,
                                'title' => 'Why Athletes Choose IronPulse Over Commercial Chains',
                                'highlightWord' => 'Commercial Chains',
                                'brandColName' => 'IronPulse Club',
                                'competitorColName' => 'Budget Gym Chains',
                                'r1Feature' => 'Equipment Quality & Availability',
                                'r1Us' => '100% Eleiko & Hammer Strength (Zero Waiting)',
                                'r1Them' => 'Generic Machines (Frequently Broken & Queued)',
                                'r2Feature' => 'Coaching & Trainer Credentials',
                                'r2Us' => 'CSCS Certified & Exercise Science Degrees',
                                'r2Them' => 'Weekend Online Certified Instructors',
                                'r3Feature' => 'Recovery Suites (Sauna & Cold Plunge)',
                                'r3Us' => 'Unlimited Infrared Sauna & Ice Baths Included',
                                'r3Them' => 'Extra $50 - $100/Month Add-on Fee',
                                'r4Feature' => 'Facility Cleanliness & Sanitation',
                                'r4Us' => 'Continuous Antimicrobial Air & Surface Cleaning',
                                'r4Them' => 'Overcrowded, Dirty Locker Rooms',
                                'r5Feature' => 'Peak Hours Member Density',
                                'r5Us' => 'Strict Capacity Caps for Spaced Workouts',
                                'r5Them' => 'Oversold Memberships & Long Wait Times',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_reviews_' . uniqid(),
                            'type' => 'testimonial_grid',
                            'settings' => [
                                'sectionId' => 'trainers',
                                'badge' => 'MEMBER TRANSFORMATIONS',
                                'showBadge' => true,
                                'title' => 'Real Results from Dedicated Members',
                                'showStars' => true,
                                't1Name' => 'Marcus Vance',
                                't1Role' => 'Competitive Powerlifter',
                                't1Quote' => 'The calibrated Eleiko plates, multiple monolifts, and community of dedicated lifters make IronPulse the premier strength facility in the state.',
                                't1Photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                                't2Name' => 'Sarah Jenkins',
                                't2Role' => 'Marathoner & Triathlete',
                                't2Quote' => 'The recovery lounge with cold plunges and Normatec compression cut my marathon recovery time in half. Phenomenal staff and coaching.',
                                't2Photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
                                't3Name' => 'David Chen',
                                't3Role' => 'Tech Executive',
                                't3Quote' => 'Down 28 lbs in 4 months with the tailored metabolic coaching. Flexible 24/7 keycard access fits my busy executive schedule perfectly.',
                                't3Photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_faq_' . uniqid(),
                            'type' => 'faq_section',
                            'settings' => [
                                'sectionId' => 'faq',
                                'badge' => 'MEMBERSHIP FAQ',
                                'showBadge' => true,
                                'title' => 'Frequently Asked Questions',
                                'q1' => 'Can I try the facility before committing to a membership?',
                                'a1' => 'Yes! We offer a 3-Day VIP All-Access Trial Pass so you can experience our equipment, recovery suites, and group training classes with zero commitment.',
                                'q2' => 'What are your facility operating hours?',
                                'a2' => 'Members enjoy 24/7 keycard access 365 days a year. Front desk staff, trainers, and recovery suites are staffed daily from 6:00 AM to 10:00 PM.',
                                'q3' => 'Is personal coaching included in membership?',
                                'a3' => 'All new memberships include two complimentary 60-minute 1-on-1 goal assessment sessions and InBody 570 biometric body composition scans.',
                                'q4' => 'Can I freeze or cancel my membership anytime?',
                                'a4' => 'Yes, we offer flexible month-to-month memberships with no long-term contracts and hassle-free account freezing via our member portal.',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_contact_' . uniqid(),
                            'type' => 'contact_split',
                            'settings' => [
                                'sectionId' => 'contact',
                                'badge' => 'START YOUR JOURNEY',
                                'showBadge' => true,
                                'title' => 'Claim Your 3-Day VIP Pass Today',
                                'highlightWord' => 'VIP Pass',
                                'email' => 'membership@ironpulsefitness.com',
                                'phone' => '+1 (555) 839-4488',
                                'address' => '742 Fitness Boulevard, Metro Athletic Park, Suite 100',
                                'hours' => '24/7 Keycard Access · Staffed Daily 6am - 10pm',
                                'formTitle' => 'Get Your Free 3-Day VIP Pass',
                                'formSubtitle' => 'Enter your details below and your instant digital pass will be sent to your inbox.',
                                'productsList' => '3-Day VIP All-Access Pass, 1-on-1 Personal Training Consultation, Olympic Lifting Coaching, Corporate Group Pass',
                                'showInfoCards' => true,
                                'showLeadForm' => true,
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'gym_footer_' . uniqid(),
                            'type' => 'enterprise_footer',
                            'settings' => [
                                'brandName' => 'IronPulse Fitness',
                                'tagline' => 'Elite 24/7 strength training, functional conditioning, and athlete recovery club.',
                                'showSocialLinks' => true,
                                'col1Title' => 'Programs',
                                'col1Links' => 'Strength & Power, HIIT Conditioning, Athlete Recovery, Personal Coaching, Nutrition Blueprint',
                                'showCol1' => true,
                                'col2Title' => 'Quick Links',
                                'col2Links' => 'About Club, Facilities, Class Schedule, Memberships, Free Pass',
                                'showCol2' => true,
                                'col3Title' => 'Club Location',
                                'col3Info' => "742 Fitness Boulevard, Suite 100\nPhone: +1 (555) 839-4488\nEmail: membership@ironpulsefitness.com\n24/7 Member Keycard Access",
                                'showCol3' => true,
                                'copyright' => '© 2026 IronPulse Fitness Ltd. All rights reserved.',
                                'showLegalLinks' => true,
                                'background' => '#070504'
                            ],
                            'children' => []
                        ]
                    ]
                ])
            ],

            // ── 2. TITAN INDUSTRIAL STEEL & METALLURGY ──
            [
                'id' => 902,
                'name' => 'Titan Industrial Steel & Metallurgy',
                'category' => 'Industrial & Engineering',
                'thumbnail' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
                'description' => 'Comprehensive manufacturing landing layout featuring high-tensile wire products, metallurgical specs, lab certifications, and bulk order quotation forms.',
                'content_json' => json_encode([
                    'id' => 'root',
                    'type' => 'container',
                    'settings' => [
                        'direction' => 'column',
                        'padding' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'margin' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'gap' => '0px',
                        'background' => '#050e1c',
                        'minHeight' => '100vh'
                    ],
                    'children' => [
                        [
                            'id' => 'ind_nav_' . uniqid(),
                            'type' => 'nav_header',
                            'settings' => [
                                'brandName' => 'TITAN METALLURGY',
                                'showBrandText' => true,
                                'links' => 'Products, Specifications, Applications, Technology, Contact',
                                'catalogText' => 'Product Catalog',
                                'catalogUrl' => '#products',
                                'ctaText' => 'Request Quote',
                                'ctaUrl' => '#contact',
                                'isSticky' => true,
                                'background' => 'rgba(7, 20, 42, 0.94)'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_hero_' . uniqid(),
                            'type' => 'hero_slider',
                            'settings' => [
                                'sectionId' => 'home',
                                'tag' => 'CERTIFIED ISO 9001:2015 METALLURGICAL FABRICATION',
                                'title' => 'Heavy-Duty Industrial Steel & Perimeter Security',
                                'italicWords' => 'Perimeter Security',
                                'description' => 'Precision engineered high-tensile steel wire, razor concertina coils, and anti-corrosive epoxy chainlink mesh for critical infrastructure.',
                                'primaryBtnText' => 'Explore Product Specs',
                                'primaryBtnUrl' => '#products',
                                'secondaryBtnText' => 'Factory Direct Inquiry',
                                'secondaryBtnUrl' => '#contact',
                                'slide1Image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80',
                                'slide2Image' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80',
                                'slide3Image' => 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=80'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_stats_' . uniqid(),
                            'type' => 'animated_stats_bar',
                            'settings' => [
                                'background' => '#09182d',
                                's1Num' => '25+',
                                's1Label' => 'Years in Metallurgy',
                                's2Num' => '250K+',
                                's2Label' => 'Sq.Ft Facility Area',
                                's3Num' => '1,200+',
                                's3Label' => 'Infrastructure Projects',
                                's4Num' => '99.9%',
                                's4Label' => 'Tolerance Compliance'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_about_' . uniqid(),
                            'type' => 'about_showcase',
                            'settings' => [
                                'sectionId' => 'about',
                                'badge' => 'METALLURGICAL EXCELLENCE',
                                'title' => 'Advanced Fabrication Engineered for Maximum Tensile Breaking Load',
                                'highlightWord' => 'Tensile Breaking Load',
                                'description' => 'Our proprietary thermal-bonding polymer coating protects steel wires against saline corrosion, chemical runoff, and high humidity.',
                                'techBadges' => '100% Virgin Carbon Steel, Dual-Phase Zinc Barrier, Automated CNC Weaving, 25-Year Anti-Rust Warranty',
                                'h1' => 'Triple-layer anti-corrosive epoxy polymer shield',
                                'h2' => 'Uniform gauge tolerance verified with laser micrometers',
                                'h3' => 'Certified lab test reports provided with every shipment',
                                'h4' => 'Nationwide flatbed logistics & rapid project dispatch',
                                'badgeCardTitle' => 'ISO 9001:2015 Audited',
                                'badgeCardSubtitle' => 'Govt Approved Infrastructure Supplier',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_products_' . uniqid(),
                            'type' => 'product_tabs_showcase',
                            'settings' => [
                                'sectionId' => 'products',
                                'badge' => 'CORE PRODUCT CATALOG',
                                'title' => 'Engineered Industrial Perimeter Fencing Solutions',
                                'highlightWord' => 'Perimeter Fencing',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_apps_' . uniqid(),
                            'type' => 'applications_grid',
                            'settings' => [
                                'sectionId' => 'applications',
                                'badge' => 'INFRASTRUCTURE APPLICATIONS',
                                'title' => 'Proven Across High-Security Defense & Civil Projects',
                                'highlightWord' => 'High-Security Defense',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_tech_' . uniqid(),
                            'type' => 'tech_innovation',
                            'settings' => [
                                'sectionId' => 'technology',
                                'badge' => 'MANUFACTURING INNOVATION',
                                'title' => 'Robotic CNC Production & Continuous Metallurgy Testing',
                                'highlightWord' => 'Robotic CNC Production',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_compare_' . uniqid(),
                            'type' => 'comparison_table',
                            'settings' => [
                                'sectionId' => 'comparison',
                                'badge' => 'QUALITY BENCHMARK',
                                'title' => 'Why Industrial Contractors Choose Titan Over Standard Mills',
                                'highlightWord' => 'Standard Mills',
                                'brandColName' => 'Titan Industrial',
                                'competitorColName' => 'Standard Mills',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_reviews_' . uniqid(),
                            'type' => 'testimonial_grid',
                            'settings' => [
                                'badge' => 'CONTRACTOR TESTIMONIALS',
                                'title' => 'Trusted by Civil & Military Infrastructure Leaders',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_faq_' . uniqid(),
                            'type' => 'faq_section',
                            'settings' => [
                                'sectionId' => 'faq',
                                'badge' => 'TECHNICAL FAQ',
                                'title' => 'Frequently Asked Questions',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_contact_' . uniqid(),
                            'type' => 'contact_split',
                            'settings' => [
                                'sectionId' => 'contact',
                                'badge' => 'FACTORY DIRECT INQUIRY',
                                'title' => 'Connect with Our Structural Engineers & Sales Team',
                                'highlightWord' => 'Structural Engineers',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'ind_footer_' . uniqid(),
                            'type' => 'enterprise_footer',
                            'settings' => [
                                'brandName' => 'Titan Metallurgy Ltd.',
                                'tagline' => 'Global manufacturer of heavy-duty high-tensile wire and perimeter infrastructure.',
                                'background' => '#030812'
                            ],
                            'children' => []
                        ]
                    ]
                ])
            ],

            // ── 3. APEX NEXT-GEN SAAS & CLOUD ──
            [
                'id' => 903,
                'name' => 'Apex Next-Gen Cloud SaaS',
                'category' => 'SaaS & Software',
                'thumbnail' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
                'description' => 'Futuristic technology & developer SaaS template with metrics bar, feature tabs, dark cosmic violet styling, and instant trial quote onboarding.',
                'content_json' => json_encode([
                    'id' => 'root',
                    'type' => 'container',
                    'settings' => [
                        'direction' => 'column',
                        'padding' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'margin' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'gap' => '0px',
                        'background' => '#0c0920',
                        'minHeight' => '100vh'
                    ],
                    'children' => [
                        [
                            'id' => 'saas_nav_' . uniqid(),
                            'type' => 'nav_header',
                            'settings' => [
                                'brandName' => 'APEX CLOUD',
                                'showBrandText' => true,
                                'links' => 'Features, Architecture, Comparison, FAQ, Contact',
                                'catalogText' => 'API Docs',
                                'catalogUrl' => '#features',
                                'ctaText' => 'Deploy Now →',
                                'ctaUrl' => '#contact',
                                'isSticky' => true,
                                'background' => 'rgba(18, 13, 46, 0.94)'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_hero_' . uniqid(),
                            'type' => 'hero_slider',
                            'settings' => [
                                'sectionId' => 'home',
                                'tag' => 'EDGE COMPUTING & REAL-TIME DATA PIPELINE',
                                'title' => 'Scale Cloud Infrastructure at the Speed of Light',
                                'italicWords' => 'Speed of Light',
                                'description' => 'Deploy distributed microservices across 300+ global edge nodes with sub-millisecond cold starts and automated load balancing.',
                                'primaryBtnText' => 'Start 14-Day Enterprise Trial',
                                'primaryBtnUrl' => '#contact',
                                'secondaryBtnText' => 'Read Architecture Specs',
                                'secondaryBtnUrl' => '#features',
                                'slide1Image' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
                                'slide2Image' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80',
                                'slide3Image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_stats_' . uniqid(),
                            'type' => 'animated_stats_bar',
                            'settings' => [
                                'background' => '#140f33',
                                's1Num' => '99.999%',
                                's1Label' => 'Global SLA Uptime',
                                's2Num' => '< 12ms',
                                's2Label' => 'Average Edge Latency',
                                's3Num' => '10B+',
                                's3Label' => 'Daily API Requests',
                                's4Num' => '300+',
                                's4Label' => 'Global PoP Locations'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_about_' . uniqid(),
                            'type' => 'about_showcase',
                            'settings' => [
                                'sectionId' => 'features',
                                'badge' => 'NEXT-GEN ARCHITECTURE',
                                'title' => 'Zero Configuration Infrastructure Built for Scale',
                                'highlightWord' => 'Built for Scale',
                                'description' => 'Eliminate server maintenance and complex cluster orchestration. Write your logic once, and let our distributed global runtime handle automatic scaling and instant failover.',
                                'techBadges' => 'Rust Core Engine, Multi-Region Replication, SOC2 Type II Certified, End-to-End TLS 1.3 Encryption',
                                'h1' => 'Automated zero-downtime rolling canary deployments',
                                'h2' => 'Sub-millisecond global key-value and vector data storage',
                                'h3' => 'Integrated DDoS mitigation and real-time threat detection',
                                'h4' => 'Native Git integration with preview staging environments',
                                'imageUrl' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
                                'badgeCardTitle' => 'SOC2 Type II Certified',
                                'badgeCardSubtitle' => 'Enterprise Security & Compliance',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_tech_' . uniqid(),
                            'type' => 'tech_innovation',
                            'settings' => [
                                'sectionId' => 'architecture',
                                'badge' => 'CORE CAPABILITIES',
                                'title' => 'Engineered for Mission-Critical Production Workloads',
                                'highlightWord' => 'Mission-Critical',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_compare_' . uniqid(),
                            'type' => 'comparison_table',
                            'settings' => [
                                'sectionId' => 'comparison',
                                'badge' => 'THE APEX ADVANTAGE',
                                'title' => 'Why Fast-Growing Engineering Teams Choose Apex Cloud',
                                'highlightWord' => 'Apex Cloud',
                                'brandColName' => 'Apex Cloud Platform',
                                'competitorColName' => 'Legacy Cloud Providers',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_reviews_' . uniqid(),
                            'type' => 'testimonial_grid',
                            'settings' => [
                                'badge' => 'CUSTOMER SUCCESS STORIES',
                                'title' => 'Trusted by 10,000+ High-Growth Tech Companies',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_faq_' . uniqid(),
                            'type' => 'faq_section',
                            'settings' => [
                                'sectionId' => 'faq',
                                'badge' => 'PLATFORM QUESTIONS',
                                'title' => 'Frequently Asked Questions',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_contact_' . uniqid(),
                            'type' => 'contact_split',
                            'settings' => [
                                'sectionId' => 'contact',
                                'badge' => 'GET STARTED',
                                'title' => 'Deploy Your First Global Service in Under 5 Minutes',
                                'highlightWord' => 'Under 5 Minutes',
                                'formTitle' => 'Request Enterprise Demo & API Keys',
                                'formSubtitle' => 'Get immediate access to dedicated sandbox clusters and enterprise support.',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'saas_footer_' . uniqid(),
                            'type' => 'enterprise_footer',
                            'settings' => [
                                'brandName' => 'Apex Cloud Inc.',
                                'tagline' => 'Next-generation distributed edge computing and global infrastructure platform.',
                                'background' => '#070414'
                            ],
                            'children' => []
                        ]
                    ]
                ])
            ],

            // ── 4. VANGUARD EXECUTIVE CORPORATE & WEALTH ──
            [
                'id' => 904,
                'name' => 'Vanguard Executive Corporate & Wealth',
                'category' => 'Corporate & Finance',
                'thumbnail' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
                'description' => 'Ultra-premium executive management consulting and wealth advisory layout with institutional metrics, portfolio breakdowns, and private consultation onboarding.',
                'content_json' => json_encode([
                    'id' => 'root',
                    'type' => 'container',
                    'settings' => [
                        'direction' => 'column',
                        'padding' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'margin' => ['top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px'],
                        'gap' => '0px',
                        'background' => '#041411',
                        'minHeight' => '100vh'
                    ],
                    'children' => [
                        [
                            'id' => 'van_nav_' . uniqid(),
                            'type' => 'nav_header',
                            'settings' => [
                                'brandName' => 'VANGUARD ADVISORY',
                                'showBrandText' => true,
                                'links' => 'Advisory, Solutions, Governance, Insights, Contact',
                                'catalogText' => 'Annual Report',
                                'catalogUrl' => '#solutions',
                                'ctaText' => 'Private Consultation',
                                'ctaUrl' => '#contact',
                                'isSticky' => true,
                                'background' => 'rgba(5, 25, 21, 0.94)'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_hero_' . uniqid(),
                            'type' => 'hero_slider',
                            'settings' => [
                                'sectionId' => 'home',
                                'tag' => 'STRATEGIC INSTITUTIONAL WEALTH & CORPORATE GOVERNANCE',
                                'title' => 'Architecting Enduring Value for Global Enterprises',
                                'italicWords' => 'Enduring Value',
                                'description' => 'Bespoke corporate restructuring, cross-border M&A advisory, and multi-generational family office wealth management engineered for resilient growth.',
                                'primaryBtnText' => 'Schedule Confidential Advisory',
                                'primaryBtnUrl' => '#contact',
                                'secondaryBtnText' => 'Explore Institutional Solutions',
                                'secondaryBtnUrl' => '#solutions',
                                'slide1Image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
                                'slide2Image' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
                                'slide3Image' => 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=80'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_stats_' . uniqid(),
                            'type' => 'animated_stats_bar',
                            'settings' => [
                                'background' => '#07211c',
                                's1Num' => '$14.8B+',
                                's1Label' => 'Assets Under Advisory',
                                's2Num' => '98.4%',
                                's2Label' => 'Institutional Retention',
                                's3Num' => '42',
                                's3Label' => 'Global Market Jurisdictions',
                                's4Num' => '30+ Yrs',
                                's4Label' => 'Fiduciary Track Record'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_about_' . uniqid(),
                            'type' => 'about_showcase',
                            'settings' => [
                                'sectionId' => 'about',
                                'badge' => 'FIDUCIARY EXCELLENCE',
                                'title' => 'Disciplined Governance Rooted in Institutional Rigor',
                                'highlightWord' => 'Institutional Rigor',
                                'description' => 'Our senior partners combine quantitative risk modeling with strategic board-level counsel to safeguard enterprise liquidity and unlock capital efficiency.',
                                'techBadges' => 'SEC Registered Fiduciary, ISO 27001 Certified, Tier-1 Global Custodians, Multi-Jurisdiction Compliance',
                                'h1' => 'Comprehensive capital allocation and liquidity preservation',
                                'h2' => 'Cross-border tax structuring and regulatory compliance',
                                'h3' => 'Direct access to institutional private equity and credit markets',
                                'h4' => 'Dedicated senior partner oversight on every client engagement',
                                'imageUrl' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
                                'badgeCardTitle' => 'Tier-1 Fiduciary Standard',
                                'badgeCardSubtitle' => 'SEC & International Regulatory Compliance',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_solutions_' . uniqid(),
                            'type' => 'product_tabs_showcase',
                            'settings' => [
                                'sectionId' => 'solutions',
                                'badge' => 'ADVISORY PRACTICES',
                                'title' => 'Comprehensive Solutions for Institutional Capital',
                                'highlightWord' => 'Institutional Capital',
                                'p1Tab' => 'Corporate Strategy & M&A',
                                'p1Title' => 'Cross-Border Mergers, Acquisitions & Carve-Outs',
                                'p1Desc' => 'End-to-end transaction advisory, commercial due diligence, and capital structuring for enterprise scale transformations.',
                                'p1Image' => 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
                                'p1SpecCore' => 'Enterprise Valuation & Synergies',
                                'p1SpecBarb' => 'Senior Partner Transaction Lead',
                                'p1SpecCoating' => 'Global Regulatory & Anti-Trust Filing',
                                'p1SpecTensile' => 'Full Fiduciary Oversight',
                                'p2Tab' => 'Family Office Wealth',
                                'p2Title' => 'Multi-Generational Liquidity & Estate Preservation',
                                'p2Desc' => 'Customized asset allocation strategies, philanthropic trust architecture, and succession governance for prominent families.',
                                'p2Image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                                'p2SpecCore' => 'Preservation & Tax Optimization',
                                'p2SpecBarb' => 'Customized Investment Policy (IPS)',
                                'p2SpecCoating' => 'Direct Private Equity & Real Estate',
                                'p2SpecTensile' => 'Confidential Family Governance',
                                'p3Tab' => 'Risk & Restructuring',
                                'p3Title' => 'Capital Structure Optimization & Balance Sheet Defense',
                                'p3Desc' => 'Stress-testing macroeconomic volatility, debt refinancing, and corporate turnaround leadership.',
                                'p3Image' => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
                                'p3SpecCore' => 'Liquidity & Working Capital Shield',
                                'p3SpecBarb' => 'Turnaround Leadership & Advisory',
                                'p3SpecCoating' => 'Debt Syndicate Negotiation',
                                'p3SpecTensile' => 'Board-Level Reporting',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_compare_' . uniqid(),
                            'type' => 'comparison_table',
                            'settings' => [
                                'sectionId' => 'governance',
                                'badge' => 'OUR COMMITMENT',
                                'title' => 'Why Enterprise Boards Choose Vanguard Advisory',
                                'highlightWord' => 'Vanguard Advisory',
                                'brandColName' => 'Vanguard Executive',
                                'competitorColName' => 'Traditional Investment Banks',
                                'r1Feature' => 'Fiduciary Alignment & Incentives',
                                'r1Us' => '100% Fee-Only (Zero Product Kickbacks)',
                                'r1Them' => 'Commission-Driven Product Cross-Selling',
                                'r2Feature' => 'Partner Direct Engagement',
                                'r2Us' => 'Senior Managing Partners Lead Every Account',
                                'r2Them' => 'Junior Analysts Handle Day-to-Day Execution',
                                'r3Feature' => 'Confidentiality & Data Sovereignty',
                                'r3Us' => 'Encrypted Sovereign Air-Gapped Portals',
                                'r3Them' => 'Standard Cloud Shared Infrastructure',
                                'r4Feature' => 'Market Access & Co-Investments',
                                'r4Us' => 'Direct Institutional Co-Investment Flow',
                                'r4Them' => 'Retail Mutual Funds & High Management Fees',
                                'r5Feature' => 'Client Retention Rate',
                                'r5Us' => '98.4% Average Over 15+ Year Horizon',
                                'r5Them' => 'High Turnover & Frequent Advisory Shifts',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_reviews_' . uniqid(),
                            'type' => 'testimonial_grid',
                            'settings' => [
                                'badge' => 'BOARD-LEVEL ENDORSEMENTS',
                                'title' => 'Perspectives from Industry Chief Executives & Chairs',
                                't1Name' => 'Arthur Sterling',
                                't1Role' => 'Chairman, Sterling Global Holdings',
                                't1Quote' => 'Vanguard’s counsel during our $2.4B cross-border merger was irreplaceable. Flawless strategic execution and strict regulatory navigation.',
                                't1Photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                                't2Name' => 'Elena Rostova',
                                't2Role' => 'Principal, Rostova Family Office',
                                't2Quote' => 'Their multi-generational wealth governance framework gave our family complete clarity across six international tax jurisdictions.',
                                't2Photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
                                't3Name' => 'Charles Montgomery',
                                't3Role' => 'CEO, Montgomery Energy Infrastructure',
                                't3Quote' => 'Disciplined risk mitigation, direct partner accountability, and exceptional market intelligence in complex environments.',
                                't3Photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_faq_' . uniqid(),
                            'type' => 'faq_section',
                            'settings' => [
                                'sectionId' => 'faq',
                                'badge' => 'CLIENT INQUIRIES',
                                'title' => 'Frequently Addressed Governance Questions',
                                'q1' => 'What is the minimum asset threshold for institutional advisory?',
                                'a1' => 'We primarily serve corporate enterprises with enterprise values exceeding $50M and private client portfolios starting at $10M in investable liquidity.',
                                'q2' => 'How does Vanguard maintain fiduciary fee transparency?',
                                'a2' => 'We operate under a pure fee-only fiduciary model, charging fixed retainer or percentage-of-advisory fees with zero third-party commissions.',
                                'q3' => 'Can Vanguard advise on cross-border tax and regulatory jurisdictions?',
                                'a3' => 'Yes, our cross-border practice advises across North America, the UK, the European Union, Singapore, and key offshore jurisdictions.',
                                'q4' => 'How is client confidentiality and non-disclosure handled?',
                                'a4' => 'All preliminary discussions are conducted under institutional NDAs with strict air-gapped data segregation protocols.',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_contact_' . uniqid(),
                            'type' => 'contact_split',
                            'settings' => [
                                'sectionId' => 'contact',
                                'badge' => 'CONFIDENTIAL ENGAGEMENT',
                                'title' => 'Initiate a Board-Level Advisory Consultation',
                                'highlightWord' => 'Advisory Consultation',
                                'email' => 'advisory@vanguardexecutive.com',
                                'phone' => '+1 (800) 492-7710',
                                'address' => '500 Executive Plaza, Financial District, Tower One, 48th Floor',
                                'formTitle' => 'Request Private Partner Consultation',
                                'formSubtitle' => 'Submit your engagement inquiry and a Senior Managing Partner will respond within 12 business hours.',
                                'productsList' => 'Corporate Strategy & M&A Advisory, Family Office Wealth Management, Capital Restructuring, Institutional Board Governance',
                                'background' => 'transparent'
                            ],
                            'children' => []
                        ],
                        [
                            'id' => 'van_footer_' . uniqid(),
                            'type' => 'enterprise_footer',
                            'settings' => [
                                'brandName' => 'Vanguard Executive Advisory',
                                'tagline' => 'Global institutional wealth advisory, cross-border M&A counsel, and fiduciary governance.',
                                'col1Title' => 'Practices',
                                'col1Links' => 'M&A Advisory, Family Office, Capital Structuring, Sovereign Wealth, Governance',
                                'col2Title' => 'Institutional',
                                'col2Links' => 'Partners, Leadership, Case Studies, Publications, Contact',
                                'col3Title' => 'Global HQ',
                                'col3Info' => "500 Executive Plaza, 48th Floor\nPhone: +1 (800) 492-7710\nEmail: advisory@vanguardexecutive.com\nSEC Registered Fiduciary",
                                'copyright' => '© 2026 Vanguard Executive Advisory Group LLC. All rights reserved.',
                                'background' => '#020d0b'
                            ],
                            'children' => []
                        ]
                    ]
                ])
            ]
        ];
    }
}

