FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]