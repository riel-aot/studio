# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:20-slim

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install dependencies. This includes devDependencies which are needed for `next dev`.
RUN npm install

# Copy the rest of the application's code into the container.
# Note: In the docker-compose setup, this will be overwritten by the volume mount,
# but it's good practice to have it here for building the image standalone.
COPY . .

# Build the Next.js application for production
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone Next.js server output from the builder stage
COPY --from=builder /app/.next/standalone ./

# Copy the public and static assets
C

# Expose the port the app will run on.
# The default is 3000, but our project is configured for 9002.
EXPOSE 9002

# The default command to run when starting the container.
# This will be overridden by the `command` in docker-compose.yml, but it's good for clarity.
CMD ["npm", "run", "dev"]
