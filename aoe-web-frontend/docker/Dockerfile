ARG FRONTEND_CONFIGURATION
FROM node:18.20.6-bookworm AS front-builder

WORKDIR /app
ADD ./ /app/

ARG FRONTEND_CONFIGURATION

RUN echo "The frontend configuration is: $FRONTEND_CONFIGURATION"

RUN npm ci && \
    npm run build --no-cache -- --configuration "$FRONTEND_CONFIGURATION"

FROM openresty/openresty:1.19.9.1-4-bullseye
COPY --from=front-builder /app/dist/ /usr/share/nginx/html/
COPY ./docker/server.conf /etc/nginx/conf.d/default.conf
