// Seed script to create initial admin user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('Checking if admin user exists...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });

    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation.');
      return;
    }

    // Admin credentials - should be changed immediately after first login
    const adminData = {
      name: 'Restaurant Admin',
      email: 'admin@vietbaguette.co.uk',
      password: 'admin123!',  // This is temporary and should be changed immediately
      role: 'ADMIN',
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        role: adminData.role,
      },
    });

    console.log(`
    -------------------------------------------------
    🎉 Admin User Created Successfully 🎉
    
    Email: ${adminData.email}
    Password: ${adminData.password}
    
    ⚠️ IMPORTANT: Change the password after first login!
    -------------------------------------------------
    `);

  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
}); 