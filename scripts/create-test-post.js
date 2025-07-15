const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPost() {
  try {
    // 创建一个测试文章
    const post = await prisma.post.create({
      data: {
        title: '测试文章',
        slug: 'test-article',
        content: `
          <h2>这是一篇测试文章</h2>
          <p>这篇文章用于测试博客系统的文章访问功能是否正常工作。</p>
          <p>如果你能看到这篇文章，说明系统运行正常！</p>
          <ul>
            <li>测试项目1</li>
            <li>测试项目2</li>
            <li>测试项目3</li>
          </ul>
        `,
        description: '这是一篇测试文章，用于验证系统功能',
        published: true,
        author: {
          connect: { id: 1 } // 假设ID为1的用户存在
        },
        tags: {
          connectOrCreate: [
            {
              where: { name: '测试' },
              create: { name: '测试' }
            },
            {
              where: { name: '示例' },
              create: { name: '示例' }
            }
          ]
        }
      }
    });

    console.log('测试文章创建成功:', post);
  } catch (error) {
    console.error('创建测试文章失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行创建测试文章函数
createTestPost(); 
const prisma = new PrismaClient();

async function createTestPost() {
  try {
    // 创建一个测试文章
    const post = await prisma.post.create({
      data: {
        title: '测试文章',
        slug: 'test-article',
        content: `
          <h2>这是一篇测试文章</h2>
          <p>这篇文章用于测试博客系统的文章访问功能是否正常工作。</p>
          <p>如果你能看到这篇文章，说明系统运行正常！</p>
          <ul>
            <li>测试项目1</li>
            <li>测试项目2</li>
            <li>测试项目3</li>
          </ul>
        `,
        description: '这是一篇测试文章，用于验证系统功能',
        published: true,
        author: {
          connect: { id: 1 } // 假设ID为1的用户存在
        },
        tags: {
          connectOrCreate: [
            {
              where: { name: '测试' },
              create: { name: '测试' }
            },
            {
              where: { name: '示例' },
              create: { name: '示例' }
            }
          ]
        }
      }
    });

    console.log('测试文章创建成功:', post);
  } catch (error) {
    console.error('创建测试文章失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行创建测试文章函数
createTestPost(); 