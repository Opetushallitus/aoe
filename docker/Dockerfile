FROM node:16.20.1-alpine3.18
COPY . /app

WORKDIR /app
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
