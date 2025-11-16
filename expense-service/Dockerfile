# Expense Service Dockerfile

# 1) Base Node image
FROM node:22-alpine

# 2) Set working directory
WORKDIR /usr/src/app

# 3) Copy package files
COPY package*.json ./

# 4) Install dependencies (production only)
RUN npm ci --omit=dev

# 5) Copy entire service
COPY . .

# 6) Environment variables
ENV NODE_ENV=production
ENV PORT=5003

# 7) Expose port
EXPOSE 5003

# 8) Start the service
CMD ["npm", "start"]
