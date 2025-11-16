# ---- Build stage ----
FROM node:22-alpine AS build

# 1) Set working directory
WORKDIR /usr/src/app

# 2) Copy package.json + package-lock.json
COPY package*.json ./

# 3) Install dependencies
RUN npm ci

# 4) Copy the rest of the frontend code
COPY . .

# 5) Build the production bundle
# CI=false avoids CRA treating warnings as errors inside Docker
ENV CI=false
RUN npm run build

# ---- Run stage (Nginx) ----
FROM nginx:stable-alpine

# 6) Copy build output from previous stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# 7) Expose HTTP port
EXPOSE 80

# 8) Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
