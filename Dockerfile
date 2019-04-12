FROM node:11.13.0-alpine
ADD . /app
WORKDIR /app
RUN yarn install
RUN yarn build
RUN yarn serve
