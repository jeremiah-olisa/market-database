# Use official Node.js image as base
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy application code
COPY migrations/ ./migrations/
COPY seeders/ ./seeders/
COPY utils/ ./utils/
COPY index.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Command to run migrations and seeders
CMD ["pnpm", "run", "migrate"]