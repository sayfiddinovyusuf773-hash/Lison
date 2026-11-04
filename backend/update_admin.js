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
  db.run(
    "UPDATE users SET email = ?, password_hash = ? WHERE role = 'super_admin' OR id = 'usr-admin-1'",
    [email.toLowerCase().trim(), hash],
    function(runErr) {
      if (runErr) {
        console.error('Database update error:', runErr);
        process.exit(1);
      }
      console.log(`✅ Admin muvaffaqiyatli yangilandi! Email: ${email}, o'zgartirilgan qatorlar: ${this.changes}`);
      db.close();
    }
  );
});
