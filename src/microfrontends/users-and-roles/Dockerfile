# syntax=docker/dockerfile:1
FROM node:20-bullseye-slim AS builder
WORKDIR /workspace

COPY package.json nx.json tsconfig.base.json tsconfig.json ./
COPY src/shell-app/client/package.json src/shell-app/client/package.json
COPY src/shell-app/server/package.json src/shell-app/server/package.json
COPY src/microfrontends/users-and-roles/client/package.json src/microfrontends/users-and-roles/client/package.json
COPY src/microfrontends/users-and-roles/server/package.json src/microfrontends/users-and-roles/server/package.json
RUN npm install --legacy-peer-deps

COPY . .
RUN npm install --prefix src/microfrontends/users-and-roles/server --omit=dev --legacy-peer-deps
RUN npx nx run users-and-roles-client:build

FROM node:20-bullseye-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /workspace/src/microfrontends/users-and-roles/server/package.json ./package.json
COPY --from=builder /workspace/src/microfrontends/users-and-roles/server/node_modules ./node_modules

COPY src/microfrontends/common /common
COPY src/microfrontends/common ./common
COPY src/server /server
COPY src/microfrontends/users-and-roles/manifest.json ./manifest.json
COPY src/microfrontends/users-and-roles/server ./server
COPY --from=builder /workspace/src/microfrontends/users-and-roles/client/dist ./client/dist

EXPOSE 4402
ENV MICROFRONT_PORT=4402
CMD ["node", "server/server.js"]
