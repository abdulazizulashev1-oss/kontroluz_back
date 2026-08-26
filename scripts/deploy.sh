#!/bin/bash

# Exit on error
set -e

echo "🚀 Kontrol.uz Server Update Script starting..."

export NODE_ENV=production

echo "📥 1. Pulling latest code from Git..."
git pull origin main

echo "📦 2. Installing npm dependencies..."
npm install --production=false

echo "🏗 3. Building Strapi Admin & TypeScript (NODE_ENV=production)..."
NODE_OPTIONS="--max-old-space-size=2048" NODE_ENV=production npm run build

echo "🔄 4. Reloading PM2 process in Production mode..."
pm2 reload kontrol-back || NODE_ENV=production pm2 start npm --name "kontrol-back" -- run start

echo "✅ Deployment finished successfully! Status:"
pm2 status
