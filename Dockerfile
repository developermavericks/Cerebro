# --- Stage 1: Build the Vite Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Run the Unified Backend Server ---
FROM node:20-alpine
WORKDIR /app

# Copy server package configuration and install production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Return to application root and copy necessary server files & built frontend
WORKDIR /app
COPY server/ ./server/
COPY --from=frontend-builder /app/dist ./dist/

# Set production variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/index.js"]
