FROM node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
COPY . /app

WORKDIR /app
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
