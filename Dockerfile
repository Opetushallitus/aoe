FROM tiangolo/node-frontend:10 as build-stage
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY ./ /app/

RUN npm run build-prod
 
FROM nginx:1.15-alpine
COPY --from=build-stage /app/dist/ /usr/share/nginx/html

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY --from=build-stage /nginx.conf /etc/nginx/conf.d/default.conf