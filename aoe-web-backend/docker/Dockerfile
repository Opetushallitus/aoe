FROM node:20-alpine3.22@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435 AS node_builder

WORKDIR /app
COPY ./ /app

# Install only locked dependencies from package-lock.json (faster)
RUN npm ci && \
    npm run build -- --omit=dev && \
mkdir -p /app/h5p && \
    unzip /app/docker/h5p.zip -d /app/h5p

FROM node:20-alpine3.22@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435

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

COPY ./views /app/views
COPY ./vendor /app/vendor
COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./src/search/aoemapping.json /app
COPY ./src/search/aoecollectionmapping.json /app

RUN (cd /app && npm ci) && \
    npm uninstall -g npm

EXPOSE 3000
WORKDIR /app
CMD ["node", "dist/server.js"]
