# 🍜 ResepPedia — Backend API

REST API untuk platform resep masakan ResepPedia, dibangun dengan Node.js + Express.js + MySQL.

---

## 🚀 Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js 5 |
| Database | MySQL + Sequelize ORM |
| Auth | JWT + bcryptjs |
| File Upload | Multer + Cloudinary |
| Email | Nodemailer (Gmail / SendGrid) |
| Validation | Joi |
| Security | Helmet, CORS, Rate Limiter |

---

## ✨ Fitur Utama

### 🔐 Authentication & Authorization
- Register & login dengan JWT token (expire 8 jam)
- Password di-hash dengan bcrypt (cost factor 12)
- Role-based access control: `user`, `contributor`, `admin`
- Forgot password & reset via email token (expire 1 jam)
- Rate limiting login — max 10 percobaan per 15 menit per IP

### 🍲 Resep
- CRUD resep lengkap dengan ingredients & steps
- Upload cover image ke Cloudinary
- Upload foto per langkah memasak
- Sistem approval — resep masuk `pending` dulu sebelum `published`
- Filter by kategori, daerah, negara, kesulitan, waktu masak
- Sort by terbaru, terpopuler, rating tertinggi
- Full-text search by judul & deskripsi
- Resep unggulan (featured) & trending

### ⭐ Rating & Koleksi
- Submit rating 1-5 bintang + review text
- 1 user hanya bisa rating 1x per resep (bisa update)
- Auto-recalculate `rating_avg` setiap ada rating baru
- Simpan resep ke koleksi pribadi

### 📂 Kategori, Daerah & Negara
- CRUD kategori dengan icon emoji
- CRUD daerah dengan thumbnail & relasi ke negara
- CRUD negara dengan kode ISO & flag emoji
- Filter resep berdasarkan kategori / daerah / negara

### 🏷️ Tags
- Auto-create tag baru saat submit resep
- Filter resep berdasarkan tag

### 👤 User Profile
- Update profil (nama, bio, lokasi)
- Upload avatar ke Cloudinary
- Lihat resep milik sendiri
- Lihat koleksi tersimpan
- Hapus akun

### 🛡️ Admin Panel
- List & approve/reject resep pending
- Manajemen user (lihat, ubah role, hapus)
- Analytics: total resep, user, pending

---

## 🔒 Keamanan

| Ancaman | Proteksi |
|---|---|
| SQL Injection | Sequelize ORM (parameterized query) |
| XSS | Helmet headers + sanitasi input |
| Brute Force | Rate limiter per IP+email |
| Timing Attack | bcrypt.compare palsu saat email tidak ditemukan |
| Password Bocor | bcrypt hash, password exclude dari semua response |
| Token Abuse | JWT expire 8 jam, payload minimal |
| Info Leakage | Pesan error generik, stack trace hanya di development |
| CORS | Whitelist origin via `ALLOWED_ORIGINS` |
| Body Flooding | Request body dibatasi 10kb |

---

## 📁 Struktur Folder

```
backend/
├── migrations/          # Sequelize migrations
├── seeders/             # Demo data seeder
├── scripts/
│   ├── security-check.js  # Cek keamanan otomatis
│   └── crud-check.js      # Test semua endpoint CRUD
├── src/
│   ├── app.js             # Express setup + middleware + routes
│   ├── config/
│   │   ├── config.js      # Sequelize config (baca dari .env)
│   │   ├── db.js          # MySQL2 connection
│   │   └── cloudinary.js  # Cloudinary config
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth, authorize, rate limiter, upload, validate
│   ├── models/            # Sequelize models
│   ├── routes/            # Express routes
│   ├── services/          # Upload & email service
│   ├── utils/             # Helper functions
│   └── validators/        # Joi schemas
└── server.js              # Entry point
```

---

## 🗄️ Database Schema

```
users          → id, name, email, password, role, avatar_url, bio, location
recipes        → id, title, slug, description, author_id, category_id, region_id, country_id, ...
ingredients    → id, recipe_id, name, amount, unit, notes
steps          → id, recipe_id, step_number, instruction, image_url, duration_minutes
categories     → id, name, slug, icon, description
regions        → id, name, slug, country_id, thumbnail_url
countries      → id, name, code, flag_emoji, continent
ratings        → id, recipe_id, user_id, score, review_text
saved_recipes  → id, user_id, recipe_id
tags           → id, name, slug
recipe_tags    → recipe_id, tag_id
```

---

## 🛠️ Instalasi & Setup

### 1. Clone & Install

```bash
git clone https://github.com/ilham269/Resep_pedia.git
cd Resep_pedia
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reseppedia

# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_random_secret_here

FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

# Cloudinary (opsional, untuk upload gambar)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (opsional, untuk reset password)
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

### 3. Buat Database

```sql
CREATE DATABASE reseppedia;
```

### 4. Jalankan Migration

```bash
npm run migrate
```

### 5. Isi Demo Data (opsional)

```bash
npm run seed
```

Demo data yang masuk:
- 4 kategori, 4 negara, 4 daerah
- 2 user (admin + contributor)
- 4 resep published (Rendang, Nasi Goreng, Gado-gado, Ayam Betutu)

**Demo accounts:**
```
Admin  → admin@reseppedia.com  / Admin123
User   → budi@reseppedia.com   / User1234
```

### 6. Jalankan Server

```bash
npm run dev    # development (nodemon)
npm start      # production
```

Server berjalan di `http://localhost:3000`

---

## 📡 API Endpoints

### Auth — `/api/auth`
```
POST   /register              → Daftar akun baru
POST   /login                 → Login, dapat JWT token
GET    /me                    → Info user (protected)
POST   /forgot-password       → Kirim email reset
POST   /reset-password/:token → Reset password baru
GET    /users                 → List semua user (admin only)
```

### Recipes — `/api/recipes`
```
GET    /                      → List resep (filter, sort, pagination)
GET    /featured              → Resep unggulan
GET    /trending              → Resep trending
GET    /search?q=             → Cari resep
GET    /:slug                 → Detail resep
POST   /                      → Buat resep (auth)
PUT    /:id                   → Update resep (auth + owner)
DELETE /:id                   → Hapus resep (auth + owner/admin)
POST   /:id/save              → Simpan ke koleksi (auth)
DELETE /:id/save              → Hapus dari koleksi (auth)
POST   /:id/rating            → Submit rating (auth)
GET    /:id/ratings           → List rating resep
POST   /:id/steps/:stepId/image → Upload foto langkah (auth)
```

### Users — `/api/users`
```
GET    /me                    → Profil sendiri (auth)
PUT    /me                    → Update profil (auth)
PUT    /me/avatar             → Upload avatar (auth)
GET    /me/recipes            → Resep saya (auth)
GET    /me/saved              → Koleksi tersimpan (auth)
DELETE /me/account            → Hapus akun (auth)
GET    /:id                   → Profil publik user
```

### Categories — `/api/categories`
```
GET    /                      → Semua kategori
GET    /:slug/recipes         → Resep by kategori
POST   /                      → Tambah (admin)
PUT    /:id                   → Update (admin)
DELETE /:id                   → Hapus (admin)
```

### Regions — `/api/regions`
```
GET    /                      → Semua daerah
GET    /:slug                 → Detail daerah
GET    /:slug/recipes         → Resep by daerah
POST   /                      → Tambah (admin)
PUT    /:id                   → Update (admin)
```

### Countries — `/api/countries`
```
GET    /                      → Semua negara
GET    /:code/recipes         → Resep by negara (ISO code)
POST   /                      → Tambah (admin)
```

### Tags — `/api/tags`
```
GET    /                      → Semua tag
GET    /:slug/recipes         → Resep by tag
```

### Admin — `/api/admin` *(admin only)*
```
GET    /recipes/pending       → List resep pending
PUT    /recipes/:id/approve   → Publish resep
PUT    /recipes/:id/reject    → Tolak resep
GET    /users                 → List semua user
PUT    /users/:id/role        → Ubah role user
DELETE /users/:id             → Hapus user
GET    /analytics             → Stats dashboard
```

---

## 🧪 Testing

### Security Check
```bash
npm run security:check
```
Mengecek 43 poin keamanan — env variables, dependencies, middleware, code security.

### CRUD Check
```bash
# Pastikan server sudah jalan dulu
npm run dev

# Di terminal lain
npm run crud:check
```
Otomatis test semua endpoint, cek proteksi auth/role, lalu cleanup data test.

---

## 📦 Scripts

```bash
npm run dev           # Jalankan server development
npm start             # Jalankan server production
npm run migrate       # Jalankan semua migration
npm run migrate:undo  # Rollback migration terakhir
npm run seed          # Isi demo data
npm run security:check # Cek keamanan
npm run crud:check    # Test semua endpoint
```

---

## 🌐 Format Response

Semua endpoint menggunakan format response yang konsisten:

```json
// Success
{
  "success": true,
  "message": "Berhasil mengambil data",
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}

// Error
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [{ "field": "title", "message": "Judul wajib diisi" }]
}
```

---

## 🤝 Kontribusi

1. Fork repo ini
2. Buat branch baru: `git checkout -b feat/nama-fitur`
3. Commit: `git commit -m "feat: tambah fitur X"`
4. Push: `git push origin feat/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

MIT License — bebas digunakan untuk keperluan apapun.

---

<p align="center">Made with ❤️ by <a href="https://github.com/ilham269">ilham269</a></p>
