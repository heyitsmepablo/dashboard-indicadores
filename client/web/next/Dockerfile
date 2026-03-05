# ==========================================
# ESTÁGIO 1: Build
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código fonte do frontend
COPY . .

# Desativa a telemetria do Next.js para não atrasar o build
ENV NEXT_TELEMETRY_DISABLED=1

# Realiza o build de produção do Next.js
RUN npm run build

# ==========================================
# ESTÁGIO 2: Produção
# ==========================================
FROM node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copia os arquivos essenciais para rodar o Next.js em produção
COPY --from=builder /usr/src/app/next.config.mjs ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

# Comando padrão do Next.js para rodar em produção
CMD ["npm", "start"]