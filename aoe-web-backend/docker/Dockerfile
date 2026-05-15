ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine AS node_builder

WORKDIR /app
COPY ./ /app

# Install only locked dependencies from package-lock.json (faster)
RUN npm ci && \
    npm run build -- --omit=dev && \
mkdir -p /app/h5p && \
    unzip /app/docker/h5p.zip -d /app/h5p

FROM node:${NODE_VERSION}-alpine

# Copy source code and configuration files to the app directory
COPY --from=node_builder /app/dist/ /app/dist/
COPY --from=node_builder /app/h5p/ /app/h5p/

WORKDIR /app

RUN apk add --no-cache \
    fontconfig \
    libreoffice \
    ttf-dejavu \
    ttf-freefont \
    ttf-liberation

RUN wget -q -O /app/rds-ca-bundle.pem \
    https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

COPY ./views /app/views
COPY ./vendor /app/vendor
COPY ./migrations /app/migrations
COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./src/search/aoemapping.json /app
COPY ./src/search/aoecollectionmapping.json /app

RUN (cd /app && npm ci) && \
    npm uninstall -g npm

EXPOSE 3000
WORKDIR /app
CMD ["node", "dist/server.js"]
