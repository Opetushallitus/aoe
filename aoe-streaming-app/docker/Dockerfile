FROM node:18-alpine
COPY . /app

WORKDIR /app
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
