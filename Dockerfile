# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY client ./client
COPY server ./server

# Build client and server
RUN cd client && CI=false npm run build
RUN cd server && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/client/build ./client/build
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/package.json ./server/

WORKDIR /app/server

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "run", "start-no-migrate"]
