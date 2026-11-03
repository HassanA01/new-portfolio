FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
COPY scripts ./scripts
RUN npm ci

FROM dependencies AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM dependencies AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM build AS test
RUN npm run lint && npm run typecheck && npm test

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
RUN addgroup -S portfolio && adduser -S portfolio -G portfolio
COPY --from=build --chown=portfolio:portfolio /app/.next/standalone ./
COPY --from=build --chown=portfolio:portfolio /app/.next/static ./.next/static
COPY --from=build --chown=portfolio:portfolio /app/public ./public
COPY --from=build --chown=portfolio:portfolio /app/private ./private
USER portfolio
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:3000/resume').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
