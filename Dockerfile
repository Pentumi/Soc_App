# Build stage - v3.1 fresh build
FROM node:18-alpine AS builder

WORKDIR /app

# Cache buster - change this value to force rebuild
ARG CACHEBUST=20260128v3

# Copy package files
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY server/package-lock.json ./server/

# Install dependencies
RUN cd client && npm install
RUN cd server && npm ci

# Copy source code
COPY client ./client
COPY server ./server

# Build client and server
RUN cd client && CI=false npm run build
RUN cd server && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/package-lock.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy built files
WORKDIR /app
COPY --from=builder /app/client/build ./client/build
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma

WORKDIR /app/server

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "run", "start-no-migrate"]
