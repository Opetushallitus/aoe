FROM node:24-alpine@sha256:f8baf2c963e3bff767993135ae3447bb433e8d64a5e4bb65780cd29ef3a525c2
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]