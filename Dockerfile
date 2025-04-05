FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Install serve globally
RUN npm install -g serve

# Copy project files
COPY client/ .

# Build the project
RUN npm run build

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "dist", "-l", "3000"] 