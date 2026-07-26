FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN printf '#!/bin/sh\nset -e\nMAX_RETRIES=30\nCOUNT=0\nuntil npx prisma migrate deploy; do\n  COUNT=$((COUNT + 1))\n  if [ "$COUNT" -ge "$MAX_RETRIES" ]; then\n    echo "Base injoignable apres $MAX_RETRIES tentatives."\n    exit 1\n  fi\n  echo "DB pas prete (tentative $COUNT/$MAX_RETRIES), retry dans 2s..."\n  sleep 2\ndone\n\necho "Seeding..."\nnpx prisma db seed || true\n\nexec node dist/main\n' > ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

EXPOSE 3000
CMD ["./docker-entrypoint.sh"]