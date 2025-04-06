FROM node:20-alpine as base

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Development stage
FROM base as development
# Copy development environment variables
COPY .env.development .env
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Build stage for production
FROM base as build
# Copy production environment variables
COPY .env.production .env
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM nginx:alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 