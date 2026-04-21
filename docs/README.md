# Guia de Documentacao

Data de atualizacao: 2026-04-21

Este arquivo centraliza a navegacao da pasta docs e reflete o contexto atual do projeto.

## 1. Estrutura de pastas

| Pasta | Conteudo principal |
|---|---|
| docs/arquitetura | snapshots tecnicos, decisoes arquiteturais e estado consolidado por modulo |
| docs/features | visao funcional por modulo/feature |
| docs/api | contratos HTTP para integracao frontend/backend |
| docs/etapas | historico de execucao tecnica por etapa |
| docs/planejamento | guias de implementacao e planejamento por trilha |
| docs/guias | guias operacionais de time e engenharia |
| docs/lembretes | lembretes tecnicos e notas de curto prazo |
| docs/atas | registros de reuniao e decisoes operacionais |
| docs/diagramas | inventario e convencoes de diagramas |

## 2. Estado funcional consolidado

- Auth JWT: concluido.
- Professor/Turma/Aluno/Matriculas: concluido.
- Avaliacoes (blocos 1-4): concluido.
- Flashcards:
  - Bloco 1 (fundacao): concluido
  - Bloco 2 (API professor/admin): concluido
  - Bloco 3 (geracao LLM): concluido
  - Bloco 4 (API aluno): concluido

## 3. Documentos prioritarios por modulo

### Arquitetura
- docs/arquitetura/2026-04-21-estado-atual-do-sistema-consolidado.md
- docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md
- docs/arquitetura/2026-04-13-estado-atual-do-sistema-modulo-avaliacoes-geral.md
- docs/arquitetura/2026-04-07-estado-atual-do-sistema-modulo-aluno-turma.md
- docs/arquitetura/2026-04-05-estado-atual-do-sistema.md

### API
- docs/api/2026-04-19-api-modulo-flashcards-unificado.md
- docs/api/2026-04-13-api-modulo-avaliacoes-unificado.md
- docs/api/2026-04-07-api-modulo-aluno-turma-matriculas.md
- docs/api/2026-04-05-api-modulo-professor.md
- docs/api/2026-04-05-api-modulo-turma.md
- docs/api/2026-04-05-api-auth-jwt-refresh-claims.md

### Features
- docs/features/2026-04-19-feature-modulo-flashcards-unificada.md
- docs/features/2026-04-13-feature-modulo-avaliacoes-unificada.md
- docs/features/2026-04-07-feature-modulo-aluno-turma-matriculas.md
- docs/features/2026-04-05-feature-modulo-professor-crud-inicial.md
- docs/features/2026-04-05-feature-modulo-turma-crud-v1.md

### Execucao historica
- docs/etapas/2026-04-21-13-modulo-flashcards-bloco-4-aluno.md
- docs/etapas/2026-04-20-12-modulo-flashcards-bloco-3-geracao-llm.md
- docs/etapas/2026-04-19-11-modulo-flashcards-trilha-unica.md
- docs/etapas/2026-04-09-10-modulo-avaliacoes-bloco-3-geracao-llm.md

## 4. Pastas de apoio

- docs/atas/README.md: template e convencoes para atas.
- docs/diagramas/README.md: padrao de nomeacao e checklist para diagramas.

## 5. Convencoes de manutencao

1. Ao concluir um bloco tecnico, atualizar obrigatoriamente:
   - docs/api do modulo
   - docs/features do modulo
   - docs/arquitetura do modulo
   - docs/etapas (registro da execucao)
2. Em mudancas de contrato HTTP, atualizar exemplos de request/response e matriz de erros no mesmo dia.
3. Em mudancas de status de modulo, refletir aqui no docs/README e no README da raiz.
