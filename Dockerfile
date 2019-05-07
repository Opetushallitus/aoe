FROM node:12.1.0-stretch
ADD . /app
WORKDIR /app
RUN yarn install
RUN yarn build
RUN yarn serve
EXPOSE 3000
