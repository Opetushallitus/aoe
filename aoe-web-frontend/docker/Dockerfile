ARG NODE_VERSION
FROM node:${NODE_VERSION}-bookworm AS front-builder

WORKDIR /app
ADD package.json /app/
ADD package-lock.json /app/
RUN npm ci

ADD ./ /app/
RUN npm run build

FROM openresty/openresty:1.29.2.3-4-bullseye@sha256:3aa2b3eb634ea01b2ac7518af1d2c0799b46ab9c39eb6712f2b2afa99e7f0d11

RUN apt-get -q -o=Dpkg::Use-Pty=0 update && apt-get -q -o=Dpkg::Use-Pty=0 install curl -y

COPY ./docker/entrypoint.sh /app/entrypoint.sh
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["./app/entrypoint.sh"]

