FROM node:24-alpine@sha256:532571bb2b0d4fd6b4700a076facaab587c8d11ab5380d84594d0121e278d16d
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]