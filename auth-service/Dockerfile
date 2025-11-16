# Auth Service Dockerfile

# 1) Base image
FROM node:22-alpine

# 2) Set working directory in container
WORKDIR /usr/src/app

# 3) Copy package files
COPY package*.json ./

# 4) Install dependencies (prod only)
RUN npm ci --omit=dev

# 5) Copy the rest of the service code
COPY . .

# 6) Env + port
ENV NODE_ENV=production
ENV PORT=5002

# 7) Expose port
EXPOSE 5002

# 8) Start auth-service
CMD ["npm", "start"]
