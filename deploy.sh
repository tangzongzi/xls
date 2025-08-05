#!/bin/bash

echo "🚀 开始构建智能图文生成器..."

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

echo "✅ 构建完成！"
echo "📁 构建文件位于 ./dist 目录"
echo ""
echo "🌐 部署到 Netlify 的步骤："
echo "1. 访问 https://netlify.com"
echo "2. 登录或注册账号"
echo "3. 点击 'Add new site' -> 'Deploy manually'"
echo "4. 将 ./dist 文件夹拖拽到部署区域"
echo "5. 等待部署完成即可！"
echo ""
echo "或者使用 Netlify CLI："
echo "npm install -g netlify-cli"
echo "netlify deploy --prod --dir=dist"