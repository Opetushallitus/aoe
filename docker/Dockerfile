FROM node:14.18-bullseye
WORKDIR '/app'
ADD ./ /app

# Install only locked dependencies in yarn.lock (faster).
RUN yarn install --frozen-lockfile && \
    yarn build

