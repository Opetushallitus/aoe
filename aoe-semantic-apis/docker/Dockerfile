FROM node:24-alpine@sha256:4c88b90e63f31e083272a485bff22f0677cfe79547e0206d962ab762d66ad335
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]