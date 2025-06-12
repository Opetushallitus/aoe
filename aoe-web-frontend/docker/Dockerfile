FROM node:18.20.6-bookworm@sha256:f12d34408955b2081f82078e8f96c3299ca0f38d11e76086cb9b9b1b669977e4 AS front-builder

WORKDIR /app
ADD package.json /app/
ADD package-lock.json /app/
RUN npm ci

ADD ./ /app/
RUN npm run build --no-cache

FROM openresty/openresty:1.19.9.1-4-bullseye@sha256:9657cdb265dd8de73173a38212058a505b88ec46011e893756e7e906e4942488

RUN apt-get update && apt-get install curl -y

COPY ./docker/entrypoint.sh /app/entrypoint.sh
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["./app/entrypoint.sh"]

