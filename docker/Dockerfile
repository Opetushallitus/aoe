FROM node:14.15.1-stretch as front-builder
WORKDIR /app
ADD ./ /app/
RUN npm ci && \
    npm run build-demo --no-cache

FROM openresty/openresty:1.13.6.2-stretch
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /webdata
