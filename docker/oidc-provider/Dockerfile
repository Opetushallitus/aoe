FROM node:22-alpine

WORKDIR /app

RUN npm install oidc-provider@9.7.1 express express-session

COPY server.js .

EXPOSE 80

CMD ["node", "server.js"]
