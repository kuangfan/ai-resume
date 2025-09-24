import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUser() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        username: true
      }
    });
    
    console.log('用户数据:', user);
    return user;
  } catch (error) {
    console.error('查询用户数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUser();