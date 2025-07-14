const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: '测试用户',
        password: hashedPassword,
      },
    });
    console.log('测试用户创建成功:', user);
  } catch (error) {
    console.error('创建用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
