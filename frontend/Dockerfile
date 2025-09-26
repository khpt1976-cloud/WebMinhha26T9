# Frontend Dockerfile for Minh Hà Website
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create .env file with default values
RUN echo "REACT_APP_API_URL=http://localhost:8000" > .env && \
    echo "PORT=12000" >> .env && \
    echo "HOST=0.0.0.0" >> .env && \
    echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" >> .env

# Expose port
EXPOSE 12000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:12000 || exit 1

# Start command
CMD ["npm", "start"]