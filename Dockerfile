# Build stage
FROM node:22.1.0-alpine AS builder

RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .
RUN npm run build

# Production stage — Fastify + PM2 (cluster-ready, graceful restarts)
FROM node:22.1.0-alpine

RUN apk update && apk upgrade && apk add --no-cache dumb-init \
    && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force \
    && npm install -g pm2@latest && npm cache clean --force

# Built SPA + server runtime
COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY server/ ./server/
COPY ecosystem.config.cjs ./

RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 21002

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:21002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
# pm2-runtime is the container-native PM2 entrypoint: keeps process in foreground,
# forwards signals, and respects ecosystem config.
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
