FROM node:20-alpine AS builder
WORKDIR /app
COPY indexer/package.json indexer/tsconfig.json ./
RUN npm install --frozen-lockfile
COPY indexer/src ./src
COPY shared ./shared
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY indexer/package.json ./
COPY indexer/src/db/migrations ./migrations
RUN mkdir -p logs
# Install psql client for migration runner
RUN apk add --no-cache postgresql-client
COPY indexer/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
CMD ["sh", "entrypoint.sh"]
