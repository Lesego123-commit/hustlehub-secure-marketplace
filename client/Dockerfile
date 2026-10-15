# Dockerfile — HustleHub+ Frontend Container
# Multi-stage build: first stage builds the React app, second serves with nginx.
#
# Vite production build: https://vite.dev/guide/build.html
# Nginx Docker image: https://hub.docker.com/_/nginx
# Docker multi-stage builds: https://docs.docker.com/build/building/multi-stage/
# React deployment: https://react.dev/learn/start-a-new-react-project
# OWASP Docker Security: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html

# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx runs on port 80 by default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
