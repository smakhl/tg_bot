FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
ENV NODE_ENV=production
RUN npm run build
ENTRYPOINT [ "node", "dist/src/index.js" ]