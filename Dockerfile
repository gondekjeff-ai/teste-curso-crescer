# Build stage
FROM node:20.19.5-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20.19.5-alpine

WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./

# Install only express for server.js (production dependency)
RUN npm install express

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server.js
COPY server.js ./

# Expose port
EXPOSE 3000

# Start the application with Node.js
CMD ["node", "server.js"]
