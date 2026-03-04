# Histórico de Mudanças

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo. Consulte [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) para diretrizes de commits.

## [1.0.0-alpha.4](https://github.com/heyitsmepablo/dashboard-indicadores/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2026-03-04)

### ⚠ BREAKING CHANGES

* A tabela 'unidades' agora exige a coluna 'cnes' para persistência
e o ambiente Python requer o Poetry para gestão de dependências.

### ✨ Funcionalidades

* **backend:** implement ministerial indicators, global aggregation and AI analysis" -m " ([295f4b2](https://github.com/heyitsmepablo/dashboard-indicadores/commit/295f4b29c5bee8ea162fe356306e525f961ceec5))
* integra sincronização com DATASUS e atualiza schema de unidades ([79ed6e6](https://github.com/heyitsmepablo/dashboard-indicadores/commit/79ed6e6229bc7a34dcfb42f502817e19ad8f53dd))
* integração DATASUS, filtros de data no comparador e redesign do Meu Painel ([e7e0c2f](https://github.com/heyitsmepablo/dashboard-indicadores/commit/e7e0c2f2c6b918b1d6aea854b742b7cc9d15f65c))
* integração do panorama ministerial, filtros dinâmicos de tempo e IA context-aware ([95fe60f](https://github.com/heyitsmepablo/dashboard-indicadores/commit/95fe60f7e1cb2cbfe566419d5cf5322fd1775706))

### 📚 Documentação

* atualizando env example ([bf48990](https://github.com/heyitsmepablo/dashboard-indicadores/commit/bf489901f2cb65f5a851bbd297ad7f23c533255c))

## [1.0.0-alpha.3](https://github.com/heyitsmepablo/dashboard-indicadores/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2026-03-01)

### ✨ Funcionalidades

* **apí:** integração com n8n e Gemini para análise automatizada de indicadores ([cd29a60](https://github.com/heyitsmepablo/dashboard-indicadores/commit/cd29a60427ab850b901930a3acb5d735c2c64c10))
* **client/web:** Dashify Insight AI ([de5bf35](https://github.com/heyitsmepablo/dashboard-indicadores/commit/de5bf354cf072e4813e9ba9750ff19371cfad732))

## [1.0.0-alpha.2](https://github.com/heyitsmepablo/dashboard-indicadores/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2026-03-01)

### ✨ Funcionalidades

* **api:** Implementado Login e Cadastro ([86566bf](https://github.com/heyitsmepablo/dashboard-indicadores/commit/86566bf051259449a90eab664016c655035af618))

## 1.0.0-beta.1 (2026-02-28)

### ✨ Funcionalidades

*  adicionando botão de ver valores nos graficos ([26ba1b6](https://github.com/heyitsmepablo/dashboard-indicadores/commit/26ba1b66d871c3fc12a61922ffe6748803933885))
* adição da analise critica ao grafico de evolução ([2521015](https://github.com/heyitsmepablo/dashboard-indicadores/commit/2521015568687a550d2afad9fb2b8391fd1b982c))
* Adicionado dockerização, client web next, e api nestjs ([616c4ec](https://github.com/heyitsmepablo/dashboard-indicadores/commit/616c4ece34237791f44ea00443997b4255e28ae4))
* adicionado foco de unidades ou de indicador na ferramenta de comparação ([7bc3e12](https://github.com/heyitsmepablo/dashboard-indicadores/commit/7bc3e12716b99b10ea4e1c2769868f14e49a3501))
* **dashboard:** reestruturação hierárquica (Sup > Tipo > Unid) e melhorias de UI/UX ([1e3da7a](https://github.com/heyitsmepablo/dashboard-indicadores/commit/1e3da7ab52ef18ea7030472738e5791ddc3ae573))
* Dockerização do database ([ee87ff7](https://github.com/heyitsmepablo/dashboard-indicadores/commit/ee87ff7c7344f2ccc3e615fac2fa2b2278699186))
* estrutura inicial do banco de dados ([5773e7a](https://github.com/heyitsmepablo/dashboard-indicadores/commit/5773e7a7960a08b553d6c2a68fdb3eacb3cf9acd))
* Implementa regras de negocios e uma UX mais fluida no comprador ([29e4446](https://github.com/heyitsmepablo/dashboard-indicadores/commit/29e4446e3b0bb50266d376a1a5f9c13ebbc06a17))
* implementa suporte multi-unidade e refatora comparador de KPIs ([c343cdb](https://github.com/heyitsmepablo/dashboard-indicadores/commit/c343cdb1cebd3048108a0c37e1ab5d6149b015b7))
* Implementado controlador e service de indicador e resultado ([3ef8e67](https://github.com/heyitsmepablo/dashboard-indicadores/commit/3ef8e671a5e94c45868a4ad5caaf0ef85c6243a3))
* implementado documentação swagger ([728d9c9](https://github.com/heyitsmepablo/dashboard-indicadores/commit/728d9c909332ee495a7864cc4994d2ec75cc04ea))
* **web:** Implementado ferramenta meu painel ([38d5a77](https://github.com/heyitsmepablo/dashboard-indicadores/commit/38d5a77e0295b021b2d9ce3dcc89777c35c718f8))

### 🐛 Correções de Bugs

* corrigindo texto dos graficos no eixo x ([3e6bdbf](https://github.com/heyitsmepablo/dashboard-indicadores/commit/3e6bdbf4bbda41384871a6051fd4d1b6d890b134))
* remoção de separetor bugado no sidebar ([8544a5b](https://github.com/heyitsmepablo/dashboard-indicadores/commit/8544a5b8cd4054101885c8efff5e2574395090a1))

### ♻️ Refatoração de Código

* reestruturação de arquitetura e melhorias avançadas de UX ([018ea7e](https://github.com/heyitsmepablo/dashboard-indicadores/commit/018ea7e2963199c21ec66db4e15331549d72c9d5))

## 1.0.0-alpha.1 (2026-02-28)

### ✨ Funcionalidades

*  adicionando botão de ver valores nos graficos ([26ba1b6](https://github.com/heyitsmepablo/dashboard-indicadores/commit/26ba1b66d871c3fc12a61922ffe6748803933885))
* adição da analise critica ao grafico de evolução ([2521015](https://github.com/heyitsmepablo/dashboard-indicadores/commit/2521015568687a550d2afad9fb2b8391fd1b982c))
* Adicionado dockerização, client web next, e api nestjs ([616c4ec](https://github.com/heyitsmepablo/dashboard-indicadores/commit/616c4ece34237791f44ea00443997b4255e28ae4))
* adicionado foco de unidades ou de indicador na ferramenta de comparação ([7bc3e12](https://github.com/heyitsmepablo/dashboard-indicadores/commit/7bc3e12716b99b10ea4e1c2769868f14e49a3501))
* **dashboard:** reestruturação hierárquica (Sup > Tipo > Unid) e melhorias de UI/UX ([1e3da7a](https://github.com/heyitsmepablo/dashboard-indicadores/commit/1e3da7ab52ef18ea7030472738e5791ddc3ae573))
* Dockerização do database ([ee87ff7](https://github.com/heyitsmepablo/dashboard-indicadores/commit/ee87ff7c7344f2ccc3e615fac2fa2b2278699186))
* estrutura inicial do banco de dados ([5773e7a](https://github.com/heyitsmepablo/dashboard-indicadores/commit/5773e7a7960a08b553d6c2a68fdb3eacb3cf9acd))
* Implementa regras de negocios e uma UX mais fluida no comprador ([29e4446](https://github.com/heyitsmepablo/dashboard-indicadores/commit/29e4446e3b0bb50266d376a1a5f9c13ebbc06a17))
* implementa suporte multi-unidade e refatora comparador de KPIs ([c343cdb](https://github.com/heyitsmepablo/dashboard-indicadores/commit/c343cdb1cebd3048108a0c37e1ab5d6149b015b7))
* Implementado controlador e service de indicador e resultado ([3ef8e67](https://github.com/heyitsmepablo/dashboard-indicadores/commit/3ef8e671a5e94c45868a4ad5caaf0ef85c6243a3))
* implementado documentação swagger ([728d9c9](https://github.com/heyitsmepablo/dashboard-indicadores/commit/728d9c909332ee495a7864cc4994d2ec75cc04ea))
* **web:** Implementado ferramenta meu painel ([38d5a77](https://github.com/heyitsmepablo/dashboard-indicadores/commit/38d5a77e0295b021b2d9ce3dcc89777c35c718f8))

### 🐛 Correções de Bugs

* corrigindo texto dos graficos no eixo x ([3e6bdbf](https://github.com/heyitsmepablo/dashboard-indicadores/commit/3e6bdbf4bbda41384871a6051fd4d1b6d890b134))
* remoção de separetor bugado no sidebar ([8544a5b](https://github.com/heyitsmepablo/dashboard-indicadores/commit/8544a5b8cd4054101885c8efff5e2574395090a1))

### ♻️ Refatoração de Código

* reestruturação de arquitetura e melhorias avançadas de UX ([018ea7e](https://github.com/heyitsmepablo/dashboard-indicadores/commit/018ea7e2963199c21ec66db4e15331549d72c9d5))
