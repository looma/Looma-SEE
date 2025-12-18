# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Create a startup script that imports tests then starts the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🔄 Importing tests from data folder..."' >> /app/start.sh && \
    echo 'node scripts/import-all-tests.mjs' >> /app/start.sh && \
    echo 'echo "🚀 Starting application..."' >> /app/start.sh && \
    echo 'exec pnpm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
