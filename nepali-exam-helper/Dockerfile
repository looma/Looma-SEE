# Use Node.js current version on Alpine 3.22
FROM node:current-alpine3.22


RUN mkdir -p /app-code

# Copy package files and install dependencies
COPY app-code/ /app-code/
WORKDIR /app-code
RUN npm ci

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
