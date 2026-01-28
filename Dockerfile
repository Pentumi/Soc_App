FROM node:18.20.5-slim

# Install OpenSSL for Prisma engine
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything
COPY . .

# Install and build
RUN cd client && npm install --legacy-peer-deps && rm -rf build && npm run build
RUN cd server && npm ci && npm run build

# Move to server directory
WORKDIR /app/server

# Start with migration
CMD ["npm", "run", "deploy"]
