FROM node:24-alpine AS builder

ARG WEBAPP_URL="https://gfts.developmentseed.org"
ARG MAPBOX_TOKEN=""
ARG GITHUB_TOKEN=""

ENV NODE_ENV=production
ENV PUBLIC_URL=${WEBAPP_URL}
ENV DATA_API=${WEBAPP_URL}
ENV MAPBOX_TOKEN=${MAPBOX_TOKEN}
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

WORKDIR /app

# Copy the pre-cloned source code (with submodules)
COPY . .

# Enable Corepack (to use Yarn 3+)
RUN corepack enable && \
    yarn install --frozen-lockfile && \
    yarn build && \
    cp ./dist/index.html ./dist/404.html

FROM nginx:alpine-slim

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
