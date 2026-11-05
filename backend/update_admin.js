const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Foydalanish: node backend/update_admin.js <email> <parol>');
  process.exit(1);
}

const dbPath = path.join(__dirname, 'ziyo_academy.db');
const db = new sqlite3.Database(dbPath);

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Hash error:', err);
    process.exit(1);
  }
  db.get("SELECT id FROM users WHERE email = ?", [email.toLowerCase().trim()], (getErr, row) => {
    if (getErr) {
      console.error(getErr);
      process.exit(1);
    }
    if (row) {
      db.run(
        "UPDATE users SET role = 'super_admin', password_hash = ? WHERE id = ?",
        [hash, row.id],
        function(runErr) {
          if (runErr) throw runErr;
          console.log(`✅ Admin muvaffaqiyatli yangilandi! Email: ${email}, o'zgartirilgan: ${this.changes}`);
          db.close();
        }
      );
    } else {
      db.run(
        "INSERT INTO users (id, email, password_hash, first_name, last_name, preferred_language, learning_level, role, xp_points, level) VALUES (?, ?, ?, 'Admin', 'LISON', 'uz', 'C2', 'super_admin', 10000, 50)",
        ['usr-admin-' + Date.now(), email.toLowerCase().trim(), hash],
        function(runErr) {
          if (runErr) throw runErr;
          console.log(`✅ Yangi Admin yaratildi! Email: ${email}`);
          db.close();
        }
      );
    }
  });
});
