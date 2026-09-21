# ⚡ LightBuilder V1

> **Lightweight, Self-Hosted Visual Website Builder**
> Built with React (Vite) + PHP 8.1+ & SQLite. Zero dependencies on WordPress, Laravel, or Node.js on the production server.

---

## 🌟 Key Features

- 🎨 **Visual Drag-and-Drop Editor**: Real-time canvas with live element selection, nested containers, and quick action floating toolbar (Duplicate, Copy, Delete).
- 📱 **Responsive Viewport Switcher**: Instantly switch and preview your designs across **Desktop (1200px)**, **Tablet (768px)**, and **Mobile (375px)**.
- ✍️ **Live Inline Text Editing**: Double-click or click directly on Headings and Text widgets in the canvas to edit text in place.
- ⚡ **Static HTML/CSS Compiler**: Compiles page component trees into clean, standalone, semantic HTML5, scoped CSS, and minimal vanilla JS with zero bloat.
- 🚀 **1-Click Publishing**: Generates static website files directly into `server/published/{site-slug}/` accessible via public URL.
- 📦 **Rich Modular Widget Suite**:
  - **Layout**: Container (Flexbox row/col, justify, align, gap, padding, margin, radius), Spacer, Divider.
  - **Basic**: Heading (H1-H6), Rich Text, Image, Button, Icon, Icon Box.
  - **Media**: Video Embed (YouTube/Vimeo), Image Gallery.
  - **Interactive**: Accordions, Tabs, Counters, Progress Bars.
  - **Advanced**: Testimonials with star ratings, Alert banners, Custom HTML / Embed blocks.
- 🖼️ **Integrated Media Library**: Upload, preview, and select images (PNG, JPG, WebP, SVG) directly within widgets.
- 🛡️ **Zero-Config Self-Hosting**: SQLite database with PDO WAL mode and `.htaccess` protection preventing direct access to database and storage files.

---

## 🚀 Getting Started (Development Mode)

### 1. Start the PHP REST Backend
Run the built-in PHP development server from the `server/` directory:
```bash
cd server
php -S 127.0.0.1:8000
```

### 2. Start the React Frontend
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open **http://localhost:5173/** in your browser.

---

## 🛠️ First Installation Setup

1. On your first visit, the **Setup Wizard** will automatically run system requirement checks:
   - ✓ PHP 8.1+
   - ✓ SQLite & PDO Extension
   - ✓ Writable Storage Directory
   - ✓ Writable Uploads Directory
2. Enter your workspace brand name and administrator credentials (name, email, password).
3. Click **Complete Installation** — the database tables and starter website will be created automatically.

---

## 🌐 Production Deployment Guide

### Option 1: Apache / Shared Hosting (cPanel / DirectAdmin / XAMPP)
1. Build the React client assets:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `client/dist/` assets to your public webroot (`public_html/`).
3. Deploy the `server/` directory to the server.
4. Ensure `server/storage/` and `server/uploads/` have write permissions (`0755` or `0775`).
5. Verify `.htaccess` files are active:
   - `server/storage/.htaccess` completely blocks HTTP access to `lightbuilder.sqlite`.
   - `server/.htaccess` routes API endpoints to `index.php`.

### Option 2: Nginx / VPS Deployment
For Nginx, configure the server block:
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/lightbuilder/client/dist;
    index index.html index.php;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API gateway
    location /api/ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/lightbuilder/server/index.php;
        include fastcgi_params;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/lightbuilder/server/uploads/;
    }

    # Published Sites
    location /published/ {
        alias /var/www/lightbuilder/server/published/;
    }

    # Deny access to sensitive directories
    location ~ /(config|database|controllers|middleware|storage|logs) {
        deny all;
    }
}
```
