FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npm install @sveltejs/adapter-node@5
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV ORIGIN=https://app.blindbitboys.com
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "build"]
