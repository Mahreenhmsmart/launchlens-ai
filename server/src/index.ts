import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolves __dirname in ES modules and loads .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorMiddleware';
import { UPLOADS_DIR } from './paths';

// Path to the Vite production build output (client/dist), resolved relative to
// the project root (one level up from server/).
const CLIENT_DIST_DIR = path.resolve(__dirname, '../../client/dist');

// ─── Route Imports ────────────────────────────────────────────────────────────
import aiRoutes from './routes/aiRoutes';
import authRoutes from './routes/authRoutes';
import emailRoutes from './routes/emailRoutes';
import productRoutes from './routes/productRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import User from './models/User';
import { protect } from './middleware/authMiddleware';

// ─── Config ───────────────────────────────────────────────────────────────────
const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/my_db';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow the SPA's own origin only — never '*'. In deployment the frontend and
// this API share one host ({id}.icod.ai), so the SPA origin == VITE_API_URL's
// origin. Any localhost port is allowed for local development. Reflecting a
// specific matched origin (not '*') keeps credentialed requests valid.
let apiOrigin: string | null = null;
try {
  if (process.env.VITE_API_URL) apiOrigin = new URL(process.env.VITE_API_URL).origin;
} catch {
  // VITE_API_URL missing or not a valid URL — leave null (localhost-only below).
}
const corsOrigins: (string | RegExp)[] = [/^http:\/\/localhost:\d+$/];
if (apiOrigin) corsOrigins.push(apiOrigin);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// ─── Static Uploads ───────────────────────────────────────────────────────────
app.use('/api/uploads', express.static(UPLOADS_DIR));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) =>
  res.json({ success: true, message: 'Server is running' })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/products', protect, productRoutes);
app.use('/api/ai', protect, aiRoutes);
app.use('/api/subscriptions', protect, subscriptionRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Production Static File Serving ──────────────────────────────────────────
// Serves the Vite production build from client/dist. Only activates when the
// dist directory exists so local development (Vite dev server) is unaffected.
if (fs.existsSync(CLIENT_DIST_DIR)) {
  // Hashed assets (JS/CSS chunks) can be cached aggressively
  app.use(
    '/assets',
    express.static(path.join(CLIENT_DIST_DIR, 'assets'), {
      immutable: true,
      maxAge: '1y',
    })
  );

  // Serve remaining static files (favicon, images, etc.) without long cache
  app.use(express.static(CLIENT_DIST_DIR, { index: false }));

  // Catch-all: serve index.html for any non-API route so client-side SPA
  // routing works correctly in production.
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
  });

  console.log(`[STATIC] Serving client build from ${CLIENT_DIST_DIR}`);
} else {
  console.log('[STATIC] Client dist not found — running in API-only / dev mode');
}

// ─── Admin User Seeding ────────────────────────────────────────────────────────
async function seedAdminUser(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  if (!adminEmail || !adminPassword) {
    console.log('[SEED] ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed');
    return;
  }

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      // Ensure role is admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save({ validateBeforeSave: false });
        console.log(`[SEED] Updated ${adminEmail} to admin role`);
      } else {
        console.log(`[SEED] Admin user ${adminEmail} already exists`);
      }
      return;
    }

    // Create new admin user
    await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
    });
    console.log(`[SEED] Created admin user: ${adminEmail}`);
  } catch (err) {
    console.error('[SEED] Failed to seed admin user:', err);
  }
}

// ─── DB + Server Bootstrap ────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] Connected to MongoDB');

    // Seed admin user on startup
    await seedAdminUser();

    app.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[STARTUP] Failed to start server:', err);
    process.exit(1);
  }
}

start();
