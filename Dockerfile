# Build stage
FROM node:20-alpine AS builder

RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

RUN apk update && apk upgrade && apk add --no-cache dumb-init \
    && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server.js ./
COPY server/ ./server/

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
