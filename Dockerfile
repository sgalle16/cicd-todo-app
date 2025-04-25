# Stage 1: Builder
FROM node:22.14.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build


# Stage 2: Production Runner
FROM node:22.14.0-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
