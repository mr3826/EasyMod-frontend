# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite build-time env vars injected as build args
ARG VITE_API_BASE_URL
ARG VITE_META_APP_ID
ARG VITE_ENV=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_META_APP_ID=$VITE_META_APP_ID \
    VITE_ENV=$VITE_ENV \
    NODE_ENV=production

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requires the container to listen on $PORT (default 8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
