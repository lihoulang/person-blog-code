// 此脚本用于同步数据库结构并测试文章入库功能
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

// 初始化 Prisma 客户端
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始同步数据库结构...');
    
    // 1. 创建测试用户（如果不存在）
    const testEmail = 'test@example.com';
    let user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!user) {
      console.log('创建测试用户...');
      // 密码加密
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      user = await prisma.user.create({
        data: {
          email: testEmail,
          name: '测试用户',
          password: hashedPassword,
          role: 'admin', // 设置为管理员角色
        }
      });
      console.log(`测试用户已创建，ID: ${user.id}`);
    } else {
      // 如果用户已存在但没有admin角色，更新为admin
      if (user.role !== 'admin') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' }
        });
        console.log(`已将用户 ${user.id} 更新为管理员角色`);
      }
      console.log(`测试用户已存在，ID: ${user.id}`);
    }
    
    // 2. 创建测试文章
    const title = `测试文章 ${new Date().toISOString()}`;
    let slug = slugify(title, { lower: true, strict: true });
    
    // 检查slug是否已存在
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }
    
    console.log('创建测试文章...');
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: '这是一篇测试文章的内容，用于验证数据库同步和文章入库功能。',
        description: '测试文章描述',
        published: true,
        author: {
          connect: { id: user.id }
        },
        tags: {
          connectOrCreate: [
            {
              where: { name: '测试' },
              create: { name: '测试' }
            },
            {
              where: { name: '数据库' },
              create: { name: '数据库' }
            }
          ]
        }
      },
      include: {
        author: {
          select: {
            name: true
          }
        },
        tags: true
      }
    });
    
    console.log('测试文章创建成功:');
    console.log(JSON.stringify(post, null, 2));
    
    // 3. 查询所有文章，验证是否成功入库
    const allPosts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true
          }
        },
        tags: true
      }
    });
    
    console.log(`数据库中共有 ${allPosts.length} 篇文章:`);
    allPosts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.title} (作者: ${p.author.name || 'Unknown'}, 标签: ${p.tags.map(t => t.name).join(', ')})`);
    });
    
    console.log('\n数据库同步和文章入库测试完成！');
    
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 