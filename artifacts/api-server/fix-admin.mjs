import bcrypt from 'bcryptjs';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const hash = await bcrypt.hash('Admin@1234', 12);
console.log('Hash prefix:', hash.substring(0, 7));

const result = await pool.query(
  'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email, role',
  [hash, 'admin@ecmarketsindia.com']
);
console.log('Updated:', result.rows[0]);
await pool.end();
