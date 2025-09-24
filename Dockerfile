# ============================================
# Base Stage: Use a Lightweight Node.js Image
# ============================================

# Use an official Node.js slim image (customizable via ARG)
FROM node:lts AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only package-related files first to leverage Docker caching
COPY . .

# Set build-time environment variables
# ENV NODE_ENV=production

# Install dependencies using npm ci (ensures a clean, reproducible install)
RUN npm ci && npm cache clean --force

RUN npm run build


# ============================================
# Stage 2: Create Production Image
# ============================================

# Use the same Node.js version for the final production container
FROM node:lts-slim AS runner

# Use a built-in non-root user for security best practices
USER node

# Set the port for the Next.js standalone server (default is 3000)
ENV PORT=3020

# Disable Next.js telemetry during runtime
ENV NEXT_TELEMETRY_DISABLE=1

# Set the working directory inside the container
WORKDIR /app

# Copy only necessary files from the builder stage to keep the image minimal
COPY --from=builder /app/.next/standalone ./      
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY .env.prod ./.env

# Expose port to allow HTTP traffic
EXPOSE $PORT

# Set the timezone to Asia/Shanghai
ENV TZ=Asia/Shanghai

# Start the application using the standalone server
ENTRYPOINT ["node", "--env-file", ".env", "server.js"]