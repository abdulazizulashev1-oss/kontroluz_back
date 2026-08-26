#!/bin/bash

# Exit on error
set -e

echo "🚀 Kontrol.uz Server Update Script starting..."

echo "📥 1. Pulling latest code from Git..."
git pull origin main

echo "📦 2. Installing npm dependencies..."
npm install --production=false

echo "🏗 3. Building Strapi Admin & TypeScript..."
NODE_OPTIONS="--max-old-space-size=2048" npm run build

echo "🔄 4. Reloading PM2 process..."
pm2 reload kontrol-backend || pm2 restart kontrol-backend

echo "✅ Deployment finished successfully! Status:"
pm2 status
