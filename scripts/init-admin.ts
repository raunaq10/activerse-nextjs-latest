/**
 * Initialize admin user script
 * Run this once: npx tsx scripts/init-admin.ts
 * Or use: npm run init-admin
 */

import connectDB from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcrypt';

async function initializeAdminUser() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-password';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'change-this-password') {
      console.warn('⚠ WARNING: Using default admin password. Please set ADMIN_PASSWORD in .env.local for security.');
    }

    const existingUser = await User.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    });

    const hash = await bcrypt.hash(adminPassword, 10);

    if (existingUser) {
      await User.updateOne(
        { _id: existingUser._id },
        { $set: { username: adminUsername, email: adminEmail, password_hash: hash } }
      );
      console.log(`✓ Admin user updated: username=${adminUsername}, email=${adminEmail}`);
    } else {
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password_hash: hash,
      });
      console.log(`✓ Admin user created: username=${adminUsername}, email=${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin user:', error);
    process.exit(1);
  }
}

initializeAdminUser();
