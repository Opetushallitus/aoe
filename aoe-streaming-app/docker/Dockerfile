FROM node:22.2.0-alpine3.18
COPY . /app

WORKDIR /app
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
