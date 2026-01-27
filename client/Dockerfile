# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/build ./build

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the app - serve will use PORT env var if set, otherwise 3000
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
