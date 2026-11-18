FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production && npm install morgan
COPY . .
EXPOSE 3001
CMD ["node", "src/index.js"]
