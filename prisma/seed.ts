import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { hashPassword } from './../src/utils/passwordUtils';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        fullName: 'Test Admin',
        birthDate: new Date('1990-01-01'),
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN' as Role,
        status: 'ACTIVE' as UserStatus,
      },
    });
    console.log('Test admin user created.');
  } else {
    console.log('Test admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
