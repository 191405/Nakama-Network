# Hosting on IONOS (Webspace)

## 1. Build the Application
First, generate the production files on your local machine:
```bash
npm run build
```
This will create a `dist` folder containing your website files.

## 2. Connect via SFTP
Use a client like **FileZilla** or **WinSCP**.

**Credentials:**
- **Host:** 960253636.webspace-data.io
- **Port:** 22
- **Protocol:** SFTP
- **User:** u112036877
- **Password:** [Your Password]

## 3. Upload Files
1. Open the connection.
2. Navigate to your web root folder on the server (usually `/` or `/public_html` or a folder named after your domain).
3. **Upload all files** inside your local `dist` folder to the server folder.
   - *Note: Upload the **contents** of `dist`, not the folder itself.*

## 4. Fix Routing (.htaccess)
Since this is a Single Page Application (React), you need to tell the server to redirect all requests to `index.html` so refreshing pages works.

Create a file named `.htaccess` in the server root (where you uploaded index.html) with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

# About Consumet Self-Hosting

The **Consumet API** is a **Node.js application**. 

**Can you host it on this IONOS plan?**
- **NO**, if this is a standard "Webspace" / Shared Hosting plan. These plans usually only host static files (HTML/CSS/JS) and PHP, not long-running Node.js servers.
- **YES**, if you upgrade to a **VPS (Virtual Private Server)** or a specific **Node.js Hosting** plan.

**Recommendation:**
Since you are using Anbuanime API (which is free and hosted) as your primary source now, you **do not necessarily need** to self-host Consumet unless you want a backup. 

If you strictly want to self-host Consumet, you will need to get a VPS (starts around $5/month) where you have full terminal access to install Node.js.
