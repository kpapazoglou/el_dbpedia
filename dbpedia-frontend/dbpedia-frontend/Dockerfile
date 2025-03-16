# Use Node.js for building the frontend
FROM node:18 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Build the React application
RUN npm run build

# Use a lightweight web server to serve the built frontend
FROM nginx:alpine

# Set working directory in final image
WORKDIR /usr/share/nginx/html

# Copy the built frontend from the builder stage
COPY --from=builder /app/dist .

# Expose frontend port
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
