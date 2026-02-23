# Dashboard de Indicadores

Este projeto visa centralizar e gerenciar os indicadores de desempenho da rede de saúde. O objetivo é substituir o controle manual disperso por um fluxo de dados automatizado, onde planilhas padronizadas alimentam um banco de dados estruturado, servindo de base para uma interface de visualização gráfica.

> 🚧 **Status:** MVP (Produto Viável Mínimo). Estrutura de banco de dados pronta. Próximos passos: Script de carga e Interface Web.

## 🏗️ Arquitetura da Solução

O fluxo de dados foi desenhado para ser simples e eficiente:

1. **Entrada de Dados:** Planilha Excel padronizada (preenchida pelos setores).
2. **Processamento (ETL):** Script em **Python** (Pandas) que lê a planilha, valida os dados e insere na tabela de `resultados`.
3. **Armazenamento:** Banco de Dados **PostgreSQL** (com tabelas de `indicadores` e `resultados`).
4. **Visualização:**
   - **API:** Backend simples para expor os dados.
   - **Frontend:** Interface Web para exibição de gráficos e acompanhamento de metas (sem login/auth nesta fase).

## 📂 Estrutura do Projeto

```text
dashboard-indicadores/
├── database/
│   ├── schema.sql             # Estrutura das tabelas (DDL)
│   ├── import_seeds.sql       # Carga inicial do catálogo de indicadores
│   └── seeds/                 # CSV com a lista oficial de indicadores
│       └── tabela_indicadores_final_revisada.csv
├── scripts/                   # (Em breve) Scripts Python para leitura das planilhas de resultados
└── README.md
```

## 🚀 Como Rodar Localmente (Banco de Dados)

Pré-requisitos

    PostgreSQL instalado.

    Python 3.x (para os futuros scripts).

Passo a Passo

    Crie o banco de dados:
    SQL

    CREATE DATABASE painel_indicadores;

    Crie a estrutura:
    Execute o arquivo database/schema.sql no seu banco de dados para criar as tabelas indicadores e resultados.

    Popule o Catálogo:
    Execute o script database/import_seeds.sql para carregar os 188 indicadores iniciais.

## 🔜 Roadmap (Próximos Passos)

    [x] Modelagem do Banco de Dados.

    [x] Carga inicial dos Indicadores (Catálogo).

    [ ] Backend: Criar script Python para ler a planilha mensal de resultados e salvar no banco.

    [ ] API: Desenvolver endpoints simples para consultar os dados.

    [ ] Frontend: Criar dashboard web para visualização dos gráficos.

Responsável: Pablo
