FROM node:18.20.5-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install and build
RUN cd client && npm install --legacy-peer-deps && npm run build
RUN cd server && npm ci && npm run build

# Move to server directory
WORKDIR /app/server

# Start
CMD ["npm", "run", "start-no-migrate"]
