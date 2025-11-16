# Analytics Service Dockerfile

# 1) Base image
FROM node:22-alpine

# 2) Set working directory
WORKDIR /usr/src/app

# 3) Copy package files
COPY package*.json ./

# 4) Install dependencies (prod only)
RUN npm ci --omit=dev

# 5) Copy the rest of the code
COPY . .

# 6) Environment & port
ENV NODE_ENV=production
ENV PORT=5004

# 7) Expose container port
EXPOSE 5004

# 8) Start the service
CMD ["npm", "start"]
