# frontend/Dockerfile

# 1) Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2) Nginx stage
FROM nginx:alpine

# Copy build output to Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Optional: override default nginx config later if needed
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
