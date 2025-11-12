FROM node:24-alpine@sha256:10d711afd59d7025ccc97fc4f1f78be8588a5f025d3a8b179af64f6720f5d99b
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]