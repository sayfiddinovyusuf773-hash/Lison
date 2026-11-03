# 🌟 LISON — Premium AI Language Learning Platform

**LISON** — Har bir til — yangi imkoniyat.
O'zbekiston yoshlari va jahon tillarini o'rganuvchilar uchun yaratilgan, sun'iy intellektga asoslangan zamonaviy, xavfsiz va to'liq interaktiv ta'lim platformasi.

🌐 **Production Veb-sayt:** [https://lison.onrender.com](https://lison.onrender.com)  
🐙 **GitHub Repozitoriy:** [https://github.com/sayfiddinovyusuf773-hash/Lison](https://github.com/sayfiddinovyusuf773-hash/Lison)

---

## 🛠 Texnologiyalar Steki (Tech Stack)

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Maxsus Deep Navy / Indigo / Soft Purple dizayn tizimi
- **Ikonkalar:** Lucide React
- **Animatsiyalar & UX:** Canvas Confetti, Framer Motion elementlari
- **Multi-language:** O'zbek (UZ), Ingliz (EN), Rus (RU) interfeys tillari
- **Mavzular:** Yorug' (Light) va Tungi (Dark) rejimlari

### Backend
- **Platforma:** Node.js, Express, TypeScript
- **Arxitektura:** RESTful API, Role-Based Access Control (RBAC)
- **Ma'lumotlar Bazasi:** SQLite (WAL rejimida yuqori tezlik va barqarorlik)
- **Autentifikatsiya:** JWT (JSON Web Tokens), bcryptjs parollarni xavfsiz heshlash
- **AI Integratsiyasi:** Google Gemini AI API (AI Ustoz & Speaking Studio)
- **Tashqi Xizmatlar:** YouTube Video Embed va oEmbed integratsiyasi

---

## 🚀 Ishga Tushirish (Local Development)

### 1. Barcha bog'liqliklarni o'rnatish
```bash
npm run install:all
```

### 2. Loyihani birgalikda ishga tushirish (Frontend + Backend)
```bash
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## ☁️ Render Deployment (Production)

Loyiha Render platformasida bitta mustahkam Web Service sifatida to'liq avtomatlashtirilgan.

* **Build Command:**
  ```bash
  npm run build
  ```
* **Start Command:**
  ```bash
  npm start
  ```
* **Muhit o'zgaruvchilari (Environment Variables):**
  * `NODE_ENV`: `production`
  * `PORT`: `10000` (Render avtomatik belgilaydi)
  * `HOST`: `0.0.0.0`
  * `JWT_SECRET`: Maxfiy JWT kaliti
  * `GEMINI_API_KEY`: Google Gemini API kaliti (AI Ustoz uchun)

---

## 👥 Sinov Hisoblari (Demo Accounts)

| Rol | Email / Login | Parol | Huquqlar |
| :--- | :--- | :--- | :--- |
| **Bosh Admin** | `admin@ziyo.uz` | `admin123` | Barcha kurslar, foydalanuvchilar, to'lovlar va darslar boshqaruvi |
| **Ustoz** | `anvar.teacher@ziyo.uz` | `teacher123` | Darslarga YouTube video qo'shish, o'quvchilar natijalarini ko'rish |
| **O'quvchi** | `student@ziyo.uz` | `student123` | Darslarni o'rganish, test va vazifalarni topshirish, AI Ustoz |

*(Shuningdek, har bir o'quvchi o'zining shaxsiy Gmail pochtasi orqali bemalol ro'yxatdan o'tishi mumkin)*

---

## 💎 Asosiy Funksional Modullar

1. **Bosh Sahifa (Homepage):** Zamonaviy qahramon bo'limi, 11 ta xalqaro til kursi, interaktiv ko'rsatkichlar.
2. **Kurslar Katalogi:** Til, daraja (A1–C2) va qidiruv bo'yicha saralash.
3. **Video Darslik Pleyeri:** YouTube video integratsiyasi, bir bosishda YouTube'ga o'tish, dars konspektlari.
4. **Interaktiv Testlar (Quiz Engine):** Server-tomonlama tekshirish, natijalarni saqlash va ballarni hisoblash.
5. **Dars Topshirish Tizimi:** Darsni shunchaki belgilash taqiqlangan; o'quvchi test yoki amaliy vazifa topshirganda ustoziga va adminga to'liq hisobot yuboriladi.
6. **Ustoz Studiyasi:** O'qituvchi o'z kursiga YouTube havolasini qo'yib, dars yaratishi va o'quvchilar natijalarini kuzatishi mumkin.
7. **AI Ustoz:** Grammatika, yangi so'zlar va erkin muloqot bo'yicha sun'iy intellektual yordamchi.
8. **Nutq Studyasi (Speaking Studio):** Talaffuz va so'zlashuv amaliyoti.
9. **Reyting & Gamifikatsiya:** XP ballari, darajalar va kunlik streaklar.
10. **Sertifikatlar:** Kursni 100% tugatganda rasmiy raqamli QR-kodli sertifikat generatsiyasi va `/verify` orqali tekshirish.
11. **Admin Panel:** Kurslar, foydalanuvchilar, to'lov so'rovlari va tizim sozlamalari.

---

## 📄 Litsenziya
Ushbu loyiha LISON ta'lim platformasi uchun ishlab chiqilgan.
