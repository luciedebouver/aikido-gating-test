# Container: end-of-life base image, demo only
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
CMD ["node", "index.js"]
