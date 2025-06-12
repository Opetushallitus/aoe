FROM node:18.20.6-bookworm AS front-builder

WORKDIR /app
ADD package.json /app/
ADD package-lock.json /app/
RUN npm ci

ADD ./ /app/
RUN npm run build --no-cache

FROM openresty/openresty:1.19.9.1-4-bullseye

RUN apt-get update && apt-get install curl -y

COPY ./docker/entrypoint.sh /app/entrypoint.sh
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["./app/entrypoint.sh"]

