FROM node:24-alpine@sha256:6ad8c47f099bc2440e0fc42f17a03297fa79955f559f10087cabf377c43ddbce
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]