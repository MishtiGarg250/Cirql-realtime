# Use official Node.js LTS image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5001

CMD ["node", "dist/index.js"]
