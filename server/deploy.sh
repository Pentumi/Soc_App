#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migrations failed, but continuing..."
fi

# Start the server
echo "🌐 Starting server..."
node dist/index.js
