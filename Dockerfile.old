# Build stage - FORCE REBUILD
FROM node:18.20.5-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY server/package-lock.json ./server/

# Install dependencies - force fresh install
RUN echo "Installing client deps - $(date)" && cd client && rm -rf node_modules && npm install --legacy-peer-deps
RUN echo "Installing server deps - $(date)" && cd server && npm ci

# Copy source code
COPY client ./client
COPY server ./server

# Build client and server
RUN cd client && CI=false npm run build
RUN cd server && npm run build

# Production stage
FROM node:18.20.5-alpine

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
