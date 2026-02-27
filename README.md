# Dashify - Dashboard de Indicadores (KPIs)

Este projeto visa centralizar, gerenciar e visualizar os indicadores de desempenho da rede de saúde. O objetivo é substituir o controle manual disperso por um fluxo de dados estruturado, servindo de base para uma interface de visualização gráfica interativa, hierárquica e inteligente.

> 🚀 **Status:** MVP Funcional. Banco de dados relacional populado, API desenvolvida e Interface Web (Frontend) completa com navegação e análises avançadas.

## 🏗️ Arquitetura da Solução e Stack Tecnológico

O sistema evoluiu para uma arquitetura moderna e escalável:

1. **Armazenamento:** **PostgreSQL** (rodando via Docker). Modelagem relacional avançada estruturada em `Superintendências > Tipos de Unidade > Unidades`.
2. **Backend (API):** Desenvolvido em **NestJS** com **Prisma ORM**, expondo endpoints RESTful para consultas filtradas e cruzamento de dados.
3. **Frontend (Dashboard):** Desenvolvido em **Next.js (React)** com **Tailwind CSS**.
   - Gráficos renderizados via **Recharts**.
   - Componentes UI baseados no **shadcn/ui** e ícones **Lucide**.
   - Gerenciamento de estado global via Context API.
4. **Entrada de Dados (ETL em construção):** Scripts em **Python** para ler planilhas padronizadas e alimentar o banco de dados. (Atualmente utilizando _Seeders_ em SQL para massa de dados de teste).

## ✨ Principais Funcionalidades (Frontend)

- **Navegação Hierárquica:** Organização inteligente por _Superintendência > Tipo de Unidade > Unidade_ através de uma Sidebar interativa e expansível.
- **Painel de Setor:** Visualização em grid de **KPI Cards** dinâmicos, que informam o último resultado, variação percentual em relação ao mês anterior, alcance de meta e disponibilidade de Análise Crítica.
- **Busca em Tempo Real:** Filtro rápido de indicadores para unidades com grande volume de dados.
- **Gráficos de Evolução:** Modal inline com gráficos de Área, Linha ou Barras mostrando o histórico de 12 meses, linha de meta (automática) e exibição detalhada de análises críticas atreladas ao mês exato.
- **Comparador:** Ferramenta avançada para cruzar múltiplos indicadores ou comparar a performance de diferentes unidades lado a lado.
- **Meu Painel:** Área customizável onde o gestor pode "fixar" (pin) indicadores de diferentes setores/unidades, com dados salvos localmente (`localStorage`).

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

    [x] Modelagem do Banco de Dados.

    [x] Carga inicial dos Indicadores (Catálogo) e massa de dados fictícia.

    [x] API: Desenvolver endpoints em NestJS com ORM Prisma.

    [x] Frontend: Criar dashboard web (Next.js) para visualização dos gráficos, filtros e comparador.

    [ ] Segurança: Implementar autenticação/login.

    [ ] Automação de Carga (ETL): Finalizar o script Python (Pandas) para ler as planilhas reais mensais de resultados e realizar upsert no banco via API.

Desenvolvido por: [Pablo Eduardo (Engenheiro de Software)](https://www.linkedin.com/in/pabloeduardoss/)
