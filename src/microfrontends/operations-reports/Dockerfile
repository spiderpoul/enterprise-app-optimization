# syntax=docker/dockerfile:1
FROM node:20-bullseye-slim AS builder
WORKDIR /workspace

COPY package.json nx.json tsconfig.base.json tsconfig.json ./
COPY src/shell-app/client/package.json src/shell-app/client/package.json
COPY src/shell-app/server/package.json src/shell-app/server/package.json
COPY src/microfrontends/operations-reports/client/package.json src/microfrontends/operations-reports/client/package.json
COPY src/microfrontends/operations-reports/server/package.json src/microfrontends/operations-reports/server/package.json
COPY src/microfrontends/users-and-roles/client/package.json src/microfrontends/users-and-roles/client/package.json
COPY src/microfrontends/users-and-roles/server/package.json src/microfrontends/users-and-roles/server/package.json
RUN npm install --legacy-peer-deps

COPY . .
RUN npx nx run operations-reports-client:build

FROM node:20-bullseye-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY src/microfrontends/operations-reports/server/package.json ./package.json
RUN npm install --omit=dev --legacy-peer-deps

COPY src/microfrontends/common ./src/microfrontends/common
COPY src/microfrontends/operations-reports/server ./src/microfrontends/operations-reports/server
COPY src/microfrontends/operations-reports/manifest.json ./src/microfrontends/operations-reports/manifest.json
COPY src/server ./src/server
COPY --from=builder /workspace/src/microfrontends/operations-reports/client/dist ./src/microfrontends/operations-reports/client/dist

EXPOSE 4400
ENV MICROFRONT_PORT=4400
CMD ["node", "src/microfrontends/operations-reports/server/server.js"]
