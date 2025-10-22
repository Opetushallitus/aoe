FROM node:24-alpine@sha256:775ba24d35a13e74dedce1d2af4ad510337b68d8e22be89e0ce2ccc299329083
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]