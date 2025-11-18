# services/budgets-service/Dockerfile

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

ENV NODE_ENV=production

# The service listens on 5004
EXPOSE 5004

CMD ["node", "index.js"]
