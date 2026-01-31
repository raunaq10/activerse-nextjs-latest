import connectDB from './mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function initializeAdminUser() {
  try {
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
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}
