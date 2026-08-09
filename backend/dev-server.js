/**
 * Dev launcher with a database fallback.
 *
 * Prefers the real MONGODB_URI from .env. If that host is unreachable it
 * boots an in-memory MongoDB instead so the app still runs — started as a
 * single-node **replica set**, because /api/complaints/stream/live uses
 * Complaint.watch() and change streams don't exist on standalone mongod.
 *
 * Data in the in-memory database is lost on exit, including user accounts.
 * Install MongoDB locally (or point MONGODB_URI at Atlas) to persist logins.
 *
 *   npm run dev:mem
 */
import dotenv from 'dotenv';
import net from 'node:net';
import crypto from 'node:crypto';

dotenv.config();

/** Credentials used for the throwaway in-memory database only. */
const DEMO_ADMIN = {
  name: 'CivicLens Admin',
  email: 'admin@civiclens.local',
  password: 'admin12345',
};

/** Strips credentials so a connection string is safe to print. */
function redact(uri) {
  return String(uri).replace(/\/\/[^@/]+@/, '//***:***@');
}

/** Cheap reachability probe so we can fail over before mongoose retries. */
function canReach(uri, timeoutMs = 1500) {
  // only probe plain host:port URIs; assume mongodb+srv (Atlas) is reachable
  if (!uri || uri.startsWith('mongodb+srv://')) return Promise.resolve(true);

  const match = uri.match(/mongodb:\/\/(?:[^@]+@)?([^/:,?]+)(?::(\d+))?/);
  if (!match) return Promise.resolve(true);

  const host = match[1];
  const port = Number(match[2] || 27017);

  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.setTimeout(timeoutMs, () => done(false));
  });
}

async function main() {
  const configured = process.env.MONGODB_URI;
  const reachable = await canReach(configured);
  // true only for the throwaway in-memory database, where printing the demo
  // admin password is harmless
  let ephemeral = false;

  if (!configured || !reachable) {
    ephemeral = true;
    if (configured) {
      console.warn(
        `Cannot reach MONGODB_URI (${redact(configured)}) — falling back to an in-memory database.`,
      );
      console.warn('Accounts and complaints will NOT persist across restarts.');
    }

    const { MongoMemoryReplSet } = await import('mongodb-memory-server');
    console.log('Starting in-memory MongoDB (replica set)…');
    const replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });

    process.env.MONGODB_URI = replSet.getUri('civiclens');
    console.log('In-memory MongoDB ready.');

    const shutdown = async () => {
      await replSet.stop();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    process.env.SEED_ON_BOOT = process.env.SEED_ON_BOOT ?? 'true';

    // A checkout with no .env has no JWT_SECRET, which would make every auth
    // route fail. The database is throwaway, so an ephemeral secret is fine —
    // it only means sessions don't survive a restart, and neither does the data.
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
      console.log('Generated a temporary JWT_SECRET for this session.');
    }

    // Likewise, seed a known admin so the admin panel is reachable out of the box.
    process.env.ADMIN_NAME = process.env.ADMIN_NAME || DEMO_ADMIN.name;
    process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || DEMO_ADMIN.email;
    process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEMO_ADMIN.password;
  } else {
    // never log the URI verbatim — it carries the database password
    console.log(`Using MongoDB at ${redact(configured)}`);
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set — auth routes will fail. Add it to .env.');
  }

  // imported only after MONGODB_URI is final — app.js connects on import
  await import('./src/app.js');

  if (process.env.SEED_ON_BOOT === 'true') {
    const mongoose = (await import('mongoose')).default;
    mongoose.connection.once('connected', async () => {
      try {
        const { seedDemoData } = await import('./seed-demo.js');
        await seedDemoData();

        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
          console.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed.');
          return;
        }

        const { ensureAdmin } = await import('./seed-admin.js');
        await ensureAdmin({
          name: process.env.ADMIN_NAME || 'CivicLens Admin',
          email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
          password: process.env.ADMIN_PASSWORD,
        });
        console.log(
          ephemeral
            ? `Admin panel: /admin/login — ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`
            : `Admin panel: /admin/login — ${process.env.ADMIN_EMAIL}`,
        );
      } catch (err) {
        console.warn('Demo seed skipped:', err.message);
      }
    });
  }
}

main().catch((err) => {
  console.error('Dev server failed to start:', err);
  process.exit(1);
});
