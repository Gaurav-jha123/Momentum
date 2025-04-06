# --- Build Stage ---
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the static files
# Ensure VITE_API_BASE_URL is set if needed during build, otherwise configure at runtime via nginx/env
# RUN npm run build -- --base=/ --mode=production # Adjust build command if needed
RUN npm run build

# --- Production Stage ---
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.25-alpine

# Copy the built static files from the build stage to the Nginx html directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]