FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
ENV NODE_ENV=production
RUN npm run build
ENTRYPOINT [ "node", "dist/src/index.js" ]