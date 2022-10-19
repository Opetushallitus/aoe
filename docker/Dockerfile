FROM node:16.13.0-alpine
COPY . /app

WORKDIR /app
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
