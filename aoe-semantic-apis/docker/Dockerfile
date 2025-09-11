FROM node:24-alpine@sha256:3e843c608bb5232f39ecb2b25e41214b958b0795914707374c8acc28487dea17
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]