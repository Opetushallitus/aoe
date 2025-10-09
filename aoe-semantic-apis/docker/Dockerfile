FROM node:24-alpine@sha256:ce19784e16d0ff4f9f11994778392ed49805d9219fd8ae4c14c253cdcfcac5cd
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]