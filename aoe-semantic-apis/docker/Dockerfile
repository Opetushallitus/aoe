FROM node:24-alpine@sha256:951203ef9d4e576c355194222fd19c2c7736f91228deb112675414ae3a7c9046
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]