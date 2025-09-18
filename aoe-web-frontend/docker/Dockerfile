FROM node:18.20.8-bookworm@sha256:c6ae79e38498325db67193d391e6ec1d224d96c693a8a4d943498556716d3783 AS front-builder

WORKDIR /app
ADD package.json /app/
ADD package-lock.json /app/
RUN npm ci

ADD ./ /app/
RUN npm run build --no-cache

FROM openresty/openresty:1.27.1.2-4-bullseye@sha256:95a56b64dfa3f22cfe523f8df1d129f6896d1a7189da87ad174c6cfe464b1cf5

RUN apt-get update && apt-get install curl -y

COPY ./docker/entrypoint.sh /app/entrypoint.sh
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["./app/entrypoint.sh"]

