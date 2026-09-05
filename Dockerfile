# Production Dockerfile for Recourse AI Risk Manager
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++ gcc libc-dev

COPY package*.json ./
RUN npm ci

COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache python3 make g++ gcc libc-dev

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/recourse.db ./recourse.db

EXPOSE 3000

CMD ["npm", "run", "start"]
