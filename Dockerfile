# Stage 1: Build application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH}

COPY . .

RUN npx svelte-kit sync && NODE_ENV=production npm run build

# Stage 2: Runtime runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S sveltekit -u 1001 -G nodejs \
    && mkdir -p /app/data/projects \
    && chown -R sveltekit:nodejs /app/data

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/static ./static

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000), (res) => { process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 1) }).on('error', () => process.exit(1))"

USER sveltekit

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/index.js"]

