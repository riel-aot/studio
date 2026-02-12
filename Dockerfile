# Stage 1: Build the application
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone Next.js server output from the builder stage
COPY --from=builder /app/.next/standalone ./



# Expose the port the app will run on.
# The default is 3000, but our project is configured for 9002.
EXPOSE 9002
ENV PORT=9002

# The command to start the production server
CMD ["node", "server.js"]
