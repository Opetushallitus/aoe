FROM node:20-alpine3.22@sha256:ddd498cc4378e4f69b0298f00c21c6f1d0a1d14f51261552e9d91614990630ce AS node_builder

WORKDIR /app
COPY ./ /app

# Install only locked dependencies from package-lock.json (faster)
RUN npm ci && \
    npm run build -- --omit=dev && \
mkdir -p /app/h5p && \
    unzip /app/docker/h5p.zip -d /app/h5p

FROM node:20-alpine3.22@sha256:ddd498cc4378e4f69b0298f00c21c6f1d0a1d14f51261552e9d91614990630ce

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
