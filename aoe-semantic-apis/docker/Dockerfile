FROM node:24-alpine@sha256:abba54e1aa65f9d795ec66541e3e829986072483bf7812ea66df83dd69f95dae
COPY . /app
WORKDIR /app

# Install only locked dependency versions defined in package-lock.json.
RUN npm ci && \
    npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]