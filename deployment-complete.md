# 部署完成与后续步骤

## 当前状态
- Vercel项目已部署：https://person-blog-6k0uw8xoo-lihl.vercel.app
- Vercel环境变量已设置：
  - `DATABASE_URL`: 目前指向本地数据库，需要更新为PlanetScale URL
  - `JWT_SECRET`: 已设置，但应使用更安全的密钥

## 剩余步骤

### 1. 创建PlanetScale账户并设置数据库
1. 访问 https://planetscale.com/sign-up 注册账户
2. 创建名为 `personal-blog` 的新数据库
3. 选择合适的区域(建议东京或新加坡)
4. 数据库创建后，点击"Connect"生成数据库凭证
5. 选择"Prisma"连接选项获取适用于Prisma的连接字符串

### 2. 使用新的数据库连接字符串更新Vercel环境变量
1. 登录Vercel仪表盘: https://vercel.com/lihl/person-blog
2. 导航至"Settings" > "Environment Variables"
3. 编辑`DATABASE_URL`环境变量，使用PlanetScale提供的连接字符串
4. 确保使用格式: `mysql://<USERNAME>:<PASSWORD>@<HOST>/<DATABASE>?sslaccept=strict`

### 3. 初始化数据库架构
本地连接到PlanetScale数据库，并创建所需的表结构：
```bash
# 使用PlanetScale CLI创建一个安全连接
pscale connect personal-blog main --port 3309

# 修改.env文件指向PlanetScale
# DATABASE_URL="mysql://root@127.0.0.1:3309/personal-blog"

# 使用Prisma推送数据库架构
npx prisma db push
```

### 4. 重新部署Vercel项目
```bash
vercel --prod
```

## 可能遇到的问题及解决方案

### 数据库连接问题
- **问题**: 应用无法连接到PlanetScale数据库
- **解决方案**: 
  - 确认连接字符串格式正确，包括用户名、密码和主机名
  - 确认PlanetScale数据库处于活动状态
  - 检查Vercel日志了解详细错误信息

### Flexsearch导入问题
- **问题**: 搜索功能报错，可能是Flexsearch导入方式不兼容
- **解决方案**:
  - 修改`src/lib/search.ts`文件中的导入语句
  - 使用CommonJS导入方式: `const FlexSearch = require('flexsearch');`
  - 重新部署应用

### 页面路由问题
- **问题**: 某些页面显示404错误
- **解决方案**:
  - 确认页面文件存在于正确位置
  - 检查Next.js配置文件
  - 查看Vercel构建日志中的警告或错误

## 长期维护建议

### 监控
- 定期检查PlanetScale数据库使用情况
- 监控Vercel部署性能和错误
- 设置自动备份策略

### 性能优化
- 使用PlanetScale查询分析工具优化数据库查询
- 确保前端页面加载速度和代码性能
- 考虑使用边缘缓存和CDN加速内容交付

### 安全
- 定期更新JWT密钥和其他安全凭证
- 确保数据库访问权限控制得当
- 监控并更新依赖包版本，防止安全漏洞 