FROM oven/bun:latest AS builder

WORKDIR /app

# Copiar package.json
COPY package.json bun.lockb* ./

# Instalar dependencias
RUN bun install --frozen-lockfile

# Copiar código
COPY . .

# Build de producción
RUN bun run build

# Imagen final con nginx
FROM nginx:alpine

# Copiar los archivos built a nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx para el proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 60015

CMD ["nginx", "-g", "daemon off;"]