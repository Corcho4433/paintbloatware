# paintbloatware/Dockerfile
FROM oven/bun:latest AS builder

WORKDIR /app

# Copiar package.json
COPY package.json bun.lockb* ./

# Instalar dependencias
RUN bun install --frozen-lockfile

# Copiar código
COPY . .

# Build de producción (compila TS y genera bundle en dist/)
RUN bun run build

# Imagen final para servir
FROM oven/bun:latest

WORKDIR /app

# Instalar vite globalmente para el comando preview
RUN bun add -g vite

# Copiar solo el build generado y archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/vite.config.ts ./

# Exponer puerto
EXPOSE 60015

# Servir con vite preview
CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "60015"]