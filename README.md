# DevPass - QR-Based Device Registration System

Final Project for Database Management System

## 📋 Prerequisites

Before you begin, make sure you have these installed on your system:

### Backend Requirements:
- **PHP 8.2+** - [Download](https://www.php.net/downloads)
  - Required extensions: `pdo`, `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`
- **Composer** - [Download](https://getcomposer.org/download/)
- **MySQL 5.7+ or MariaDB 10.3+** - [Download MySQL](https://www.mysql.com/downloads/) | [Download MariaDB](https://mariadb.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

### Frontend Requirements:
- **Node.js 18+** (includes npm) - [Download](https://nodejs.org/)
  - Recommended: Node.js 18.x or 20.x LTS

---

## 🚀 Complete Setup Guide (From GitHub Clone)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Database2v
```

Or if you already have the repository:
```bash
cd Database2v
git pull origin main
```

---

### Step 2: Backend Setup (Laravel)

#### 2.1 Navigate to Backend Directory
```bash
cd DevPass/server
```

#### 2.2 Install PHP Dependencies
```bash
composer install
```

**What this does:**
- Downloads all Laravel packages and dependencies listed in `composer.json`
- Creates the `/vendor` folder with all PHP packages
- This may take a few minutes depending on your internet connection

**If you encounter errors:**
- Make sure PHP 8.2+ is installed: `php -v`
- Make sure Composer is installed: `composer --version`
- Check that required PHP extensions are enabled

#### 2.3 Create Environment File

**On Linux/Mac:**
```bash
cp .env.example .env
```

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**On Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**If `.env.example` doesn't exist**, create a `.env` file manually with the following content:

```env
APP_NAME=DevPass
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=devpass
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
```

#### 2.4 Generate Application Key
```bash
php artisan key:generate
```

**What this does:**
- Generates a unique encryption key for your application
- Updates the `APP_KEY` in your `.env` file
- **This is required** - the application will not work without it

#### 2.5 Configure Database in `.env` File

Open the `.env` file and update these database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=devpass
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password (or your MySQL username/password if different).

#### 2.6 Create MySQL Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p
```

Then in MySQL:
```sql
CREATE DATABASE devpass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Option B: Using phpMyAdmin**
1. Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
2. Click "New" in the left sidebar
3. Database name: `devpass`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Right-click in Schemas → Create Schema
4. Name: `devpass`
5. Default Collation: `utf8mb4_unicode_ci`
6. Click "Apply"

#### 2.7 Run Database Migrations
```bash
php artisan migrate
```

**What this does:**
- Creates all database tables defined in `/database/migrations/`
- Tables created: `students`, `devices`, `qr_codes`, `entry_log`, `admins`, `gates`, `security_guards`, `password_reset_codes`, etc.
- **Important:** Make sure your database is created and `.env` is configured correctly before running this

**If you get errors:**
- Check database connection: `php artisan migrate:status`
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure the database exists

#### 2.8 (Optional) Run Database Seeders
```bash
php artisan db:seed
```

**Note:** This is optional and only needed if you want sample data.

#### 2.9 Start Backend Server
```bash
php artisan serve
```

**Backend will run at:** `http://localhost:8000`

**To run on a different port:**
```bash
php artisan serve --port=8001
```

**Keep this terminal open** - the server needs to keep running.

---

### Step 3: Frontend Setup (React + Vite)

#### 3.1 Open a New Terminal Window

**Important:** Keep the backend server running in the first terminal, and open a **new terminal window** for the frontend.

#### 3.2 Navigate to Frontend Directory
```bash
cd DevPass/client
```

#### 3.3 Install Node Dependencies
```bash
npm install
```

**What this does:**
- Downloads all Node.js packages listed in `package.json`
- Creates the `/node_modules` folder
- This may take a few minutes depending on your internet connection

**If you encounter errors:**
- Make sure Node.js 18+ is installed: `node -v`
- Make sure npm is installed: `npm -v`
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- On Windows, you might need to run PowerShell/Command Prompt as Administrator

#### 3.4 (Optional) Create Frontend Environment File

**On Linux/Mac:**
```bash
cp .env.example .env
```

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**If `.env.example` doesn't exist**, create a `.env` file in `DevPass/client/` with:

```env
VITE_API_URL=http://localhost:8000/api
```

**Note:** This is optional. The frontend will default to `http://localhost:8000/api` if this file doesn't exist. Only create it if your backend runs on a different URL or port.

#### 3.5 Start Frontend Development Server
```bash
npm run dev
```

**Frontend will run at:** `http://localhost:5173`

**Keep this terminal open** - the dev server needs to keep running.

---

## ✅ Verification

After completing all steps, you should have:

1. ✅ Backend server running at `http://localhost:8000`
2. ✅ Frontend server running at `http://localhost:5173`
3. ✅ Database `devpass` created with all tables
4. ✅ Both terminals showing server logs

**Test the application:**
1. Open your browser and go to `http://localhost:5173`
2. You should see the Landing page with Login/Register forms
3. Try registering a new student account
4. Try logging in with your credentials

---

## 📁 Project Structure

### Backend (Laravel)
```
DevPass/server/
├── app/
│   ├── Http/Controllers/    # API Controllers
│   ├── Models/               # Database Models
│   ├── Services/             # Business Logic
│   └── Mail/                 # Email Templates
├── database/
│   ├── migrations/          # Database Schema
│   └── seeders/             # Sample Data
├── routes/
│   └── api.php              # API Routes
├── config/                   # Configuration Files
├── .env                      # Environment Variables (NOT in git)
└── composer.json             # PHP Dependencies
```

### Frontend (React + Vite)
```
DevPass/client/
├── src/
│   ├── pages/               # Page Components
│   ├── components/          # Reusable Components
│   ├── services/            # API Services
│   ├── api/                 # Axios Configuration
│   └── hooks/               # Custom React Hooks
├── public/                  # Static Assets
├── .env                     # Environment Variables (NOT in git)
└── package.json             # Node Dependencies
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Class not found" or "Composer autoload" errors
**Solution:**
```bash
cd DevPass/server
composer dump-autoload
```

#### 2. Database Connection Error
**Check:**
- MySQL/MariaDB service is running
- Database credentials in `.env` are correct
- Database `devpass` exists
- User has permissions to access the database

**Test connection:**
```bash
php artisan migrate:status
```

#### 3. Port Already in Use

**Backend (port 8000):**
```bash
php artisan serve --port=8001
```
Then update frontend `.env`: `VITE_API_URL=http://localhost:8001/api`

**Frontend (port 5173):**
Vite will automatically try the next available port (5174, 5175, etc.)

#### 4. "npm install" fails
**Solutions:**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm cache clean --force`
- Try `npm install` again
- Make sure Node.js version is 18+

#### 5. "composer install" fails
**Solutions:**
- Make sure PHP 8.2+ is installed
- Check required PHP extensions are enabled
- Try `composer clear-cache`
- Try `composer install --no-cache`

#### 6. Migration Errors
**If migrations fail:**
```bash
# Check migration status
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback

# Fresh migration (WARNING: deletes all data)
php artisan migrate:fresh
```

#### 7. "APP_KEY" error
**Solution:**
```bash
cd DevPass/server
php artisan key:generate
```

#### 8. CORS Errors
**Solution:**
- Make sure backend is running on port 8000
- Check `config/cors.php` settings
- Verify `APP_URL` in `.env` matches your backend URL

#### 9. Email Not Sending (Password Reset)
**For Development:**
- Set `MAIL_MAILER=log` in `.env`
- Emails will be logged to `storage/logs/laravel.log`

**For Production:**
- Configure SMTP settings in `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

---

## 📝 Important Notes

### Files NOT in Git (Don't Commit These)
- `DevPass/server/.env` - Contains sensitive database credentials
- `DevPass/client/.env` - Contains API URL (optional)
- `DevPass/server/vendor/` - PHP dependencies (install with `composer install`)
- `DevPass/client/node_modules/` - Node dependencies (install with `npm install`)
- `DevPass/server/storage/logs/` - Application logs
- `DevPass/server/bootstrap/cache/` - Cache files

### Environment Files
- Always use `.env.example` as a template (if it exists)
- Never commit `.env` files to git
- Each developer needs their own `.env` file with their database credentials

### Database
- The `users` table migration is intentionally empty (we use `students` table instead)
- All migrations are in correct order to handle foreign key dependencies
- Run migrations in order: `php artisan migrate`

### Running the Application
- **Both servers must be running** for full functionality:
  - Backend: `php artisan serve` (Terminal 1)
  - Frontend: `npm run dev` (Terminal 2)
- Backend API: `http://localhost:8000/api`
- Frontend App: `http://localhost:5173`

---

## 🚀 Quick Start (After Initial Setup)

Once everything is set up, to start the application:

**Terminal 1 (Backend):**
```bash
cd DevPass/server
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
cd DevPass/client
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 👥 Contributors

This is a group project for Database Management System course.

---

## 📄 License

This project is for educational purposes.

---

## ⚠️ Important Reminders

1. **Always pull latest changes** before starting work: `git pull origin main`
2. **Never commit `.env` files** - they contain sensitive information
3. **Run migrations** after pulling: `php artisan migrate`
4. **Install dependencies** if `composer.json` or `package.json` changed: `composer install` / `npm install`
5. **Clear cache** if you encounter strange errors: `php artisan config:clear && php artisan cache:clear`

---

**Last Updated:** Based on current codebase review
**PHP Version Required:** 8.2+
**Node.js Version Required:** 18+
**Laravel Version:** 12.0
**React Version:** 19.1.1
