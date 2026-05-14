FROM node:20-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app/frontend
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
COPY shared/ ../shared/
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ARG INTERNAL_API_URL=http://backend:3001
ENV INTERNAL_API_URL=$INTERNAL_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
RUN mkdir -p ./public
EXPOSE 3000
CMD ["node", "server.js"]
