FROM node:24-alpine@sha256:fcf7e07dc882035af314211c67bc9b4bc1163d9316f7aabfb0b6b441f9f98380
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]