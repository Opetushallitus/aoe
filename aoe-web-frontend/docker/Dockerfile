FROM node:14.21.3-bullseye as front-builder
WORKDIR /app
ADD ./ /app/
RUN npm ci && \
    CONFIGURATION=$ENVIRONMENT npm run build-config --no-cache

FROM openresty/openresty:1.19.9.1-4-bullseye
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf
