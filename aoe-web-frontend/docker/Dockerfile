ARG FRONTEND_CONFIGURATION
FROM node:18.20.6-bookworm AS front-builder

WORKDIR /app
ADD package.json /app/
ADD package-lock.json /app/
RUN npm ci

ARG FRONTEND_CONFIGURATION

RUN echo "The frontend configuration is: $FRONTEND_CONFIGURATION"

ADD ./ /app/
RUN npm run build --no-cache -- --configuration "$FRONTEND_CONFIGURATION"

FROM openresty/openresty:1.19.9.1-4-bullseye

RUN apt-get update && apt-get install curl -y

COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf

