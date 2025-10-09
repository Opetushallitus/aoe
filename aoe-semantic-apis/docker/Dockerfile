FROM node:24-alpine@sha256:6ff78d6d45f2614fe0da54756b44a7c529a15ebcaf9832fab8df036b1d466e73
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]