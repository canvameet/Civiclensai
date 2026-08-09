/**
 * Provisions the admin account for the admin panel.
 *
 * Admin accounts are deliberately not creatable from any public form, so this
 * script is the supported way to make one:
 *
 *   npm run seed:admin
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env. Re-running is safe: an
 * existing account is promoted to 'admin' and its password reset to the
 * configured value, which doubles as the password-recovery path.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';

const MIN_PASSWORD = 8;

/**
 * Creates or updates the admin account. Assumes mongoose is already connected,
 * so the dev launcher can call it on boot without opening a second connection.
 */
export async function ensureAdmin({ email, password, name }) {
  const passwordHash = await User.hashPassword(password);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.role = 'master-admin';
    existing.passwordHash = passwordHash;
    await existing.save();
    return 'updated';
  }

  await User.create({ name, email, passwordHash, role: 'master-admin' });
  return 'created';
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = (process.env.ADMIN_NAME || 'CivicLens Admin').trim();

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.');
    process.exit(1);
  }
  if (password.length < MIN_PASSWORD) {
    console.error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD} characters.`);
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const action = await ensureAdmin({ email, password, name });
  console.log(`Admin account ${action}: ${email}`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Failed to seed admin:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
