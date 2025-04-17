FROM node:16.20.1-alpine3.18@sha256:6dbe540727117440e42b673a94883309ec9606c0fca054df314466dc55973203
COPY . /app

WORKDIR /app
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
