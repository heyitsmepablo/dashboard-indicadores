# ==========================================
# ESTÁGIO 1: Build 
# ==========================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Gera uma vez aqui para o TypeScript conseguir compilar sem erros (dist)
RUN npx prisma generate
RUN npm run build

# ==========================================
# ESTÁGIO 2: Produção (Imagem final leve)
# ==========================================
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copia os arquivos necessários do estágio de build
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# 💡 ESSENCIAL: Copia a pasta prisma para ter o schema disponível em produção
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

# 💡 A MÁGICA ACONTECE AQUI: Gera o client do zero nativo pro container e inicia a API
CMD ["sh", "-c", "npx prisma generate && npm run start:prod"]