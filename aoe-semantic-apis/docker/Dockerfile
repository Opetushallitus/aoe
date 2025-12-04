FROM node:24-alpine@sha256:6085692e50e15e1a4e83f0452e56016ea3852d27754a87365372d85f4012a898
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]