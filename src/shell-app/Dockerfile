# syntax=docker/dockerfile:1
FROM node:20-bullseye-slim AS builder
WORKDIR /workspace

COPY package.json package-lock.json nx.json tsconfig.base.json tsconfig.json ./
COPY src/shell-app/client/package.json src/shell-app/client/package.json
COPY src/shell-app/server/package.json src/shell-app/server/package.json
COPY src/microfrontends/operations-reports/client/package.json src/microfrontends/operations-reports/client/package.json
COPY src/microfrontends/operations-reports/server/package.json src/microfrontends/operations-reports/server/package.json
COPY src/microfrontends/users-and-roles/client/package.json src/microfrontends/users-and-roles/client/package.json
COPY src/microfrontends/users-and-roles/server/package.json src/microfrontends/users-and-roles/server/package.json
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx nx run shell-client:build

FROM node:20-bullseye-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY src/shell-app/server/package.json ./package.json
RUN npm install --omit=dev --legacy-peer-deps

COPY src/shell-app/server ./src/shell-app/server
COPY src/server ./src/server
COPY src/microfrontends ./src/microfrontends
COPY --from=builder /workspace/src/shell-app/client/dist ./src/shell-app/client/dist

EXPOSE 4300
ENV SHELL_PORT=4300
CMD ["node", "src/shell-app/server/shell-server.js"]
