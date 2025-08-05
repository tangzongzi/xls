# 🎨 智能图文生成器

一个基于 Vue 3 + Vite 的智能图文匹配和生成工具，支持多平台图片 API，提供个性化签名功能。

## ✨ 功能特点

### 🔍 智能图片匹配
- 支持多个图片 API：Unsplash、Pexels、Pixabay
- 智能关键词翻译和匹配
- 情感模板快速生成
- 10页图片浏览，每页9张

### 🎨 个性化签名
- 多种字体大小：小(26px)、中(30px)、大(34px)、特大(38px)
- 灵活位置设置：右下角、左下角、底部居中
- 丰富样式选择：普通、加粗、斜体
- 透明度调节：10%-100%
- 多色彩选择：白色、黑色、红色、蓝色
- 本地存储：设置自动保存，刷新不丢失

### 📱 用户体验
- 响应式设计，支持移动端
- 实时预览，所见即所得
- 一键生成和下载
- 3:4 标准比例输出
- 高清图片导出

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

### 构建部署
```bash
npm run build
```

## 🔧 配置说明

### API 密钥设置
首次使用需要设置图片 API 密钥：

1. **Unsplash**
   - 访问 [Unsplash Developers](https://unsplash.com/developers)
   - 创建应用获取 Access Key

2. **Pexels**
   - 访问 [Pexels API](https://www.pexels.com/api/)
   - 注册获取 API Key

3. **Pixabay**
   - 访问 [Pixabay API](https://pixabay.com/api/docs/)
   - 注册获取 API Key

### 技术栈
- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **图片生成**: html2canvas
- **HTTP 客户端**: Axios
- **字体**: 阿里巴巴普惠体

## 📁 项目结构

```
src/
├── components/
│   ├── ImageTextMatcher/     # 主组件
│   ├── TextInput/           # 文本输入组件
│   └── ImageSelector/       # 图片选择组件
├── services/
│   └── imageApi.js         # API 服务
├── style.css              # 全局样式
└── main.js               # 应用入口
```

## 🌐 部署

详细部署指南请查看 [DEPLOY.md](./DEPLOY.md)

### 快速部署到 Netlify
```bash
# 构建项目
npm run build

# 使用脚本部署
./deploy.sh
```

## 📄 开源协议

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题或建议，请创建 Issue 或联系开发者。

---

⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！