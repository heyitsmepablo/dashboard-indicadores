# Dashify - Dashboard de Indicadores (KPIs)

Este projeto visa centralizar, gerenciar e visualizar os indicadores de desempenho da rede de saúde. O objetivo é substituir o controle manual disperso por um fluxo de dados estruturado, servindo de base para uma interface de visualização gráfica interativa, hierárquica e inteligente.

> 🚀 **Status:** MVP Funcional e Escalável. Banco de dados relacional populado, API segura, Interface Web avançada e **Motor de Inteligência Artificial** integrado para geração automática de insights e análises críticas.

## 🏗️ Arquitetura da Solução e Stack Tecnológico

O sistema utiliza uma arquitetura moderna, orientada a microsserviços e automação:

1. **Armazenamento:** **PostgreSQL** (rodando via Docker). Modelagem relacional avançada estruturada em `Superintendências > Tipos de Unidade > Unidades`.
2. **Backend (API):** Desenvolvido em **NestJS** com **Prisma ORM**, expondo endpoints RESTful seguros para consultas filtradas e cruzamento de dados.
3. **Frontend (Dashboard):** Desenvolvido em **Next.js (React)** com **Tailwind CSS**.
   - Gráficos renderizados via **Recharts**.
   - Componentes UI baseados no **shadcn/ui** e ícones **Lucide**.
   - Gerenciamento de estado global via Context API (`DashboardContext` e `AuthContext`).
4. **Orquestração e Inteligência Artificial (Novo 🤖):** - **n8n** como gateway de automação (via Webhooks).
   - **Google Gemini 1.5 Flash** atuando como agente especialista em gestão de saúde pública para processamento de linguagem natural (NLP).
5. **Entrada de Dados (ETL em construção):** Scripts em **Python** para ler planilhas padronizadas e alimentar o banco de dados.

## ✨ Principais Funcionalidades (Frontend)

- **Dashify Insight AI:** Geração sob demanda de pareceres técnicos via Inteligência Artificial. A IA avalia previsibilidade, volatilidade e tendências da série histórica, entregando recomendações em tempo real com efeito de _streaming de tokens_ (typewriter) na interface. (Acesso restrito a usuários logados).
- **Navegação Hierárquica:** Organização inteligente por _Superintendência > Tipo de Unidade > Unidade_ através de uma Sidebar interativa e expansível.
- **Painel de Setor:** Visualização em grid de **KPI Cards** dinâmicos, que informam o último resultado, variação percentual, alcance de meta e disponibilidade de Análise Crítica.
- **Gráficos de Evolução:** Modal inline com gráficos interativos (Área, Linha, Barras) mostrando o histórico de 12 meses, linha de meta e labels dinâmicos.
- **Comparador Avançado:** Ferramenta para cruzar múltiplos indicadores ou comparar a performance de diferentes unidades lado a lado.
- **Meu Painel:** Área customizável onde o gestor pode "fixar" (pin) indicadores estratégicos, com dados persistidos no `localStorage`.
- **Autenticação:** Proteção de rotas e funcionalidades críticas via JWT (JSON Web Tokens).

## 📂 Estrutura do Projeto (Macro)

```text
dashify/
├── backend/                   # API em NestJS + Prisma
│   ├── prisma/
│   │   └── schema.prisma      # Schema do ORM
│   ├── src/                   # Controllers e Services (Superintendências, Unidades, Indicadores)
│   └── database/seeds/        # Scripts SQL de carga inicial (Catálogo e Resultados Mock)
├── frontend/                  # Aplicação Web em Next.js
│   ├── src/
│   │   ├── app/               # Rotas da aplicação
│   │   ├── components/        # UI (Sidebar, KPI Cards, Gráficos, UnitSelector)
│   │   ├── lib/               # Contexto Global, Types e Formatadores
│   │   └── services/          # Conexão com a API (fetch)
└── scripts/                   # Scripts Python (ETL) para leitura das planilhas mensais
```

## 🚀 Como Rodar Localmente

Pré-requisitos: Docker, Node.js (v18+) e PostgreSQL.

Subir o Banco de Dados (Docker):
Os containers do banco irão rodar e automaticamente executar os seeds iniciais para popular Catálogos, Unidades e Resultados históricos.

```bash
docker-compose up -d
```

Rodar a API (Backend):

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

Rodar o Dashboard (Frontend):

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:4200

🔜 Roadmap
[x] Modelagem do Banco de Dados Relacional.
[x] Carga inicial dos Indicadores (Catálogo) e massa de dados fictícia.
[x] API: Desenvolver endpoints em NestJS com ORM Prisma e validação de DTOs.
[x] Frontend: Criar dashboard web interativo (Next.js) com gráficos dinâmicos.
[x] Segurança: Implementar autenticação, JWT e controle de rotas privadas.
[x] Inteligência Artificial: Integrar motor de IA via n8n + Gemini para análises críticas sob demanda.
[ ] Automação de Carga (ETL): Finalizar o script Python (Pandas) para ler as planilhas reais mensais e realizar upsert via API.

Desenvolvido por: [Pablo Eduardo (Engenheiro de Software)](https://www.linkedin.com/in/pabloeduardoss/)
