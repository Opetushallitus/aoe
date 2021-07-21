FROM node:14.15.1-buster
WORKDIR '/app'
ADD ./ /app

# Install only locked dependencies in yarn.lock (faster).
RUN yarn install --frozen-lockfile && \
    yarn build

