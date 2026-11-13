# 🌟 LISON — Kelajak tillari platformasi

**LISON** — Har bir til — yangi imkoniyat.
O‘zbekiston yoshlari va jahon tillarini o‘rganuvchilar uchun yaratilgan, sun'iy intellektga asoslangan zamonaviy, xavfsiz va to‘liq interaktiv milliy ta'lim platformasi.

🌐 **Production Veb-sayt:** [https://lison-8j0v.onrender.com](https://lison-8j0v.onrender.com)  
🐙 **GitHub Repozitoriy:** [https://github.com/sayfiddinovyusufbek95-crypto/LISON](https://github.com/sayfiddinovyusufbek95-crypto/LISON)  
🔒 **Yashirin Admin Portali:** `https://lison-8j0v.onrender.com/secure-admin-access`

---

## 🛠 Texnologiyalar Steki (Tech Stack)

### Frontend
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Maxsus Deep Navy / Indigo / Soft Purple dizayn tizimi
- **Ikonkalar:** Lucide React
- **Animatsiyalar & UX:** Canvas Confetti, Framer Motion elementlari
- **Multi-language:** O‘zbek (UZ), Ingliz (EN), Rus (RU), Koreys (KO), Arab (AR)
- **Mavzular:** Yorug‘ (Light) va Tungi (Dark) rejimlari

### Backend
- **Platforma:** Node.js, Express 5, TypeScript
- **Arxitektura:** RESTful API, Role-Based Access Control (RBAC)
- **Ma'lumotlar Bazasi:** SQLite (WAL rejimida yuqori tezlik va barqarorlik)
- **Autentifikatsiya:** HttpOnly Secure Cookies (`lison_session`) + Bearer JWT, `bcryptjs` parollarni heshlash
- **AI Integratsiyasi:** Google Gemini AI API (AI Ustoz & Speaking Studio)
- **Video & Kurslar:** YouTube Video Embed va oEmbed integratsiyasi

---

## 🚀 Render Cloud Deployment Sozlamalari

Yangi Render akkauntida (`sayfiddinovyusufbek95@gmail.com`) Web Service yaratish uchun quyidagi konfiguratsiya ishlatiladi:

| Parametr | Qiymat |
|---|---|
| **Service Type** | Web Service |
| **Runtime** | `Node` |
| **Region** | Frankfurt (EU Central) yoki Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | *(Bo‘sh qoldiriladi)* |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path**| `/api/health` |
| **Auto-Deploy** | `Yes` |

### Kerakli Environment Variables (Muhit O‘zgaruvchilari)

| O‘zgaruvchi | Qiymat | Izoh |
|---|---|---|
| `NODE_ENV` | `production` | Production rejimi |
| `HOST` | `0.0.0.0` | Barcha interfeyslarga ulanish |
| `JWT_SECRET` | *(Render generatsiya qiladi)* | Sessiya shifrlash kaliti |
| `ADMIN_EMAIL` | `admin@gmail.com` | Bosh administrator pochtasi |
| `ADMIN_PASSWORD` | `1234` | Bosh administrator paroli |
| `GEMINI_API_KEY` | `AIzaSy...` | Gemini AI Ustoz uchun kalit |
| `RESEND_API_KEY` | `re_...` *(ixtiyoriy)* | Email yuborish uchun |

---

## 💻 Mahalliy Ishga Tushirish (Local Development)

### 1. Bog‘liqliklarni o‘rnatish:
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Frontend va Backendni birgalikda ishga tushirish:
```bash
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔒 Xavfsizlik va Autentifikatsiya

- **Ro‘yxatdan o‘tish:** Ism, Familiya, Yosh (5–120), Gmail, Parol va Parolni tasdiqlash.
- **Kirish:** Faqat Gmail va Parol.
- **Admin paneli:** Ommaviy ko‘rinmaydi, faqat `/secure-admin-access` orqali ochiladi.
- **Rollar:** Faqat bazadan tekshiriladi (`student`, `teacher`, `admin`, `super_admin`). Oddiy o‘quvchi admin API lariga kira olmaydi (`403 Forbidden`).
