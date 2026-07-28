# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite's base defaults to the GitHub Pages subfolder (see vite.config.ts).
# This image serves the site from the domain root, so override it back to '/'.
RUN BASE_PATH=/ npm run build

# --- serve stage: static nginx, gzip + long-cache for hashed assets ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
