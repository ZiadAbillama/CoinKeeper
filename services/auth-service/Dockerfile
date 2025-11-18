# services/auth-service/Dockerfile

FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the source
COPY . .

ENV NODE_ENV=production

# The service listens on 5002 (from your .env)
EXPOSE 5002

CMD ["node", "index.js"]
