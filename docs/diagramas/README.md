# Diagramas - Inventario e Convencoes

Data de criacao: 2026-04-20

Esta pasta centraliza diagramas tecnicos (ERD, fluxo, sequencia, componentes) usados para comunicar arquitetura e comportamento de modulos.

## 1. Tipos de diagrama recomendados

- ERD: modelo de dados e relacionamentos.
- Sequencia: fluxo de chamadas entre controller/service/repository/externos.
- Componentes: visao macro de modulos e dependencias.
- Fluxo funcional: regras de negocio por caso de uso.

## 2. Convencao de nome de arquivo

Padrao:
- `YYYY-MM-DD-<tipo>-<tema>.md` (quando Mermaid em markdown)
- `YYYY-MM-DD-<tipo>-<tema>.png` (quando imagem exportada)

Exemplos:
- `2026-04-20-sequencia-gerar-flashcards.md`
- `2026-04-20-erd-modulo-flashcards.png`

## 3. Recomendacao de conteudo

Todo diagrama deve incluir:
- contexto (qual fluxo/modelo representa);
- versao/data;
- origem dos dados (doc, codigo, task);
- limitacoes conhecidas.

## 4. Sincronizacao com documentacao

Sempre que um diagrama mudar contrato ou fluxo:
1. atualizar docs/api correspondente;
2. atualizar docs/arquitetura do modulo;
3. registrar a mudanca em docs/etapas quando aplicavel.
