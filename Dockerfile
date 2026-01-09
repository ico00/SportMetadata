FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files (data folder will be included since it's not in .dockerignore anymore)
COPY . .

# Verify data files are copied
RUN if [ -d "data" ] && [ "$(ls -A data 2>/dev/null)" ]; then \
      echo "📦 Initial data files found:" && \
      ls -la data/; \
    else \
      echo "📦 No initial data files found, will start with empty database"; \
      mkdir -p data; \
    fi

# Build frontend for web
RUN npm run build:web || (echo "Build failed!" && exit 1)

# Verify build output
RUN echo "=== Build output verification ===" && \
    ls -la /app/dist-web && \
    echo "=== Checking for index.html ===" && \
    test -f /app/dist-web/index.html && echo "✓ index.html exists" || echo "✗ index.html NOT FOUND"

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/index.cjs"]
