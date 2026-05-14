FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package.json backend/tsconfig.json ./
RUN npm install --frozen-lockfile
COPY backend/src ./src
COPY shared ./shared
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/package.json ./
RUN mkdir -p logs
EXPOSE 3001
CMD ["node", "dist/src/index.js"]
