ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine AS node_builder

WORKDIR /app
COPY ./ /app

# Install only locked dependencies from package-lock.json (faster)
RUN npm ci && \
    npm run build

FROM node:${NODE_VERSION}-alpine

COPY --from=node_builder /app/dist/ /app/dist/

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app

RUN npm ci --omit=dev && \
    npm uninstall -g npm

CMD ["node", "--enable-source-maps", "dist/main.js"]
