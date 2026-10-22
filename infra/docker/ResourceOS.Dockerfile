# Future self-hosting reference. Build from repository root.
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm install --no-audit --no-fund
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /srv
COPY --from=build /repo/.next/standalone ./
COPY --from=build /repo/.next/static ./.next/static
EXPOSE 3000
USER node
CMD ["node", "server.js"]
