import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../app/lib/auth';

const prisma = new PrismaClient();

async function main() {
  try {
    // Admin credentials
    const adminEmail = 'vasu23@admin.com';
    const adminPassword = 'Vasukp@2212';
    const adminName = 'Vasu Admin';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(adminPassword);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
        cart: {
          create: {} // Create an empty cart for the admin
        }
      }
    });

    console.log('Admin user created successfully!');
    console.log({
      id: admin.id,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 