ARG NODE_VERSION
FROM node:${NODE_VERSION}-bookworm AS front-builder

WORKDIR /app
ADD package.json /app/
ADD package-lock.json /app/
RUN npm ci

ADD ./ /app/
RUN npm run build

FROM openresty/openresty:1.27.1.2-4-bullseye@sha256:95a56b64dfa3f22cfe523f8df1d129f6896d1a7189da87ad174c6cfe464b1cf5

RUN apt-get update && apt-get install curl -y

COPY ./docker/entrypoint.sh /app/entrypoint.sh
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["./app/entrypoint.sh"]

