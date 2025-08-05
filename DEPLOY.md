# 🚀 智能图文生成器 - Netlify 部署指南

## 📋 部署前准备

项目已经配置好了所有必要的部署文件：
- ✅ `netlify.toml` - Netlify 配置文件
- ✅ `deploy.sh` - 自动化部署脚本
- ✅ 项目已构建完成

## 🌐 方法一：手动部署（推荐新手）

### 步骤：
1. **访问 Netlify**
   - 打开 [https://netlify.com](https://netlify.com)
   - 登录或注册账号

2. **创建新站点**
   - 点击 "Add new site"
   - 选择 "Deploy manually"

3. **上传文件**
   - 将整个 `dist` 文件夹拖拽到部署区域
   - 等待上传和部署完成

4. **完成**
   - 获得您的网站链接（如：`https://your-app-name.netlify.app`）

## 🔧 方法二：使用 Netlify CLI

### 安装 Netlify CLI：
```bash
npm install -g netlify-cli
```

### 登录并部署：
```bash
# 登录 Netlify
netlify login

# 部署到生产环境
netlify deploy --prod --dir=dist
```

## 🛠️ 方法三：Git 集成部署

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **在 Netlify 中连接 GitHub**
   - 选择 "Import from Git"
   - 连接 GitHub 仓库
   - 构建设置会自动读取 `netlify.toml`

## ⚙️ 构建配置

项目使用以下构建配置：
- **构建命令**: `npm run build`
- **发布目录**: `dist`
- **Node.js 版本**: 18

## 🔄 自动部署

使用提供的脚本快速构建：
```bash
./deploy.sh
```

## 📝 注意事项

1. **API 密钥设置**
   - 部署后需要在应用中设置图片 API 密钥
   - 支持 Unsplash、Pexels、Pixabay

2. **域名设置**
   - 可在 Netlify 控制台中设置自定义域名
   - 免费版提供 `.netlify.app` 子域名

3. **环境变量**
   - 如需要可在 Netlify 控制台中设置环境变量

## 🎉 部署完成

部署成功后，您的智能图文生成器就可以在线使用了！

### 功能特点：
- ✨ 智能图片匹配
- 🎨 个性化签名
- 📱 响应式设计
- 💾 本地设置保存
- 🔄 一键生成下载