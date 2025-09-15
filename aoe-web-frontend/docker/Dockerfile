FROM node:18.20.8-bookworm@sha256:c6ae79e38498325db67193d391e6ec1d224d96c693a8a4d943498556716d3783 AS front-builder

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

