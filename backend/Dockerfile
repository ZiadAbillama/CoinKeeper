# Backend Dockerfile for CoinKeeper

# 1) Use a small Node image
FROM node:22-alpine

# 2) Set working directory inside the container
WORKDIR /usr/src/app

# 3) Copy package.json and package-lock.json first
COPY package*.json ./

# 4) Install dependencies (prod only)
RUN npm ci --omit=dev

# 5) Copy the rest of the backend code
COPY . .

# 6) Environment and port
ENV NODE_ENV=production
ENV PORT=5001

# 7) Expose the port the app listens on
EXPOSE 5001

# 8) Start the backend
CMD ["npm", "start"]
