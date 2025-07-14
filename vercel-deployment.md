# Vercel部署指南

## 1. Vercel登录和项目设置
- 访问 https://vercel.com/login 使用GitHub账号登录
- 已部署项目：https://person-blog-hblaifkb6-lihl.vercel.app
- 项目仪表盘：https://vercel.com/lihl/person-blog

## 2. 环境变量配置

### 必需的环境变量
在Vercel项目设置中，需要添加以下环境变量：

| 变量名 | 值 | 说明 |
|-------|-----|------|
| `DATABASE_URL` | `mysql://<USERNAME>:<PASSWORD>@<HOST>/<DATABASE>?sslaccept=strict` | PlanetScale数据库连接字符串 |
| `JWT_SECRET` | `your-production-jwt-secret-key-change-this` | JWT身份验证密钥 |

### 环境变量设置步骤
1. 在Vercel仪表盘中点击项目
2. 导航到"Settings" > "Environment Variables"
3. 添加上述环境变量
4. 点击"Save"保存变更

## 3. 域名和HTTPS设置
目前使用的是Vercel提供的默认域名：`person-blog-hblaifkb6-lihl.vercel.app`

如需配置自定义域名：
1. 在Vercel项目设置中点击"Domains"
2. 添加您的自定义域名
3. 按照Vercel提供的指南配置DNS记录

## 4. 部署选项和配置

### 构建配置
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### 部署钩子
每次提交到主分支时会自动部署。

手动部署方式：
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

## 5. 持续集成/持续部署(CI/CD)

### GitHub集成
Vercel已与GitHub仓库关联，每次推送代码到主分支时会自动触发新的部署。

### 预览部署
对于非主分支的提交，Vercel会自动创建预览部署，可以在合并到主分支前测试功能。

## 6. 监控与日志
- 访问Vercel项目仪表盘查看部署状态和日志
- 部署失败时会收到邮件通知
- 可以通过"Logs"查看应用运行时日志

## 7. 性能优化
- Vercel自动对静态资源进行优化和CDN分发
- Next.js应用会自动启用页面预渲染和代码分割
- 可以在"Analytics"页面查看应用性能数据（需要专业版或企业版）

## 8. 常见问题排查

### 部署失败
- 检查构建日志确定失败原因
- 确保所有环境变量正确设置
- 验证数据库连接是否正常

### 数据库连接问题
- 确保PlanetScale数据库处于活动状态
- 验证数据库连接字符串格式正确
- 检查IP访问权限是否正确配置

### 环境变量未生效
- 确保环境变量已添加到正确的环境(Production/Preview/Development)
- 部署后环境变量更改需要重新部署应用才能生效 