FROM node:20-alpine As build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . .
RUN npm run build

#production stage
FROM nginx:stable-alpine As production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

