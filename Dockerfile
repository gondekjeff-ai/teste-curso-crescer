# Build stage
FROM node:20-alpine as builder

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --only=production && npm cache clean --force

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && apk add --no-cache dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./

# Install only express (production dependency) with clean cache
RUN npm install --only=production express && npm cache clean --force

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server.js
COPY server.js ./

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with Node.js
CMD ["node", "server.js"]
