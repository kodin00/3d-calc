# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the Vite app
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install all dependencies (need tsx for running TypeScript)
COPY package*.json ./
RUN npm ci

# Copy built assets and source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the API server using tsx
CMD ["npx", "tsx", "server/index.ts"]
