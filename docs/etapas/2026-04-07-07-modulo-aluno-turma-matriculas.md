# Etapa: Modulo Aluno + TurmaAluno (matriculas)

Data: 2026-04-07  
Ordem: 07  
Contexto: consolidacao do fluxo de aluno em turma e ajuste de contrato de API

## 1. Objetivo da etapa

Entregar o recorte funcional de aluno-turma com:
- cadastro e perfil de aluno;
- relacao de matricula aluno-turma;
- listagem de turmas por aluno;
- endpoint publico de alunos por turma;
- ajuste de naming de rota para `matriculas`.

## 2. Visao mecanica de execucao (como foi feito)

## 2.1 Passo 1 - modelagem de dados

Acoes:
- definicao/uso da entidade `Aluno` (1:1 com `User`);
- definicao/uso da entidade associativa `AlunoTurma` (N:N entre aluno e turma);
- aplicacao de unicidade em `aluno_turma(aluno_id, turma_id)`.

Arquivos envolvidos:
- `backend/src/main/java/br/com/ilumina/entity/Aluno/Aluno.java`
- `backend/src/main/java/br/com/ilumina/entity/Turma/AlunoTurma.java`
- `backend/src/main/java/br/com/ilumina/repository/Aluno/AlunoRepository.java`
- `backend/src/main/java/br/com/ilumina/repository/Turma/AlunoTurmaRepository.java`

Resultado:
- base persistente pronta para matricula sem duplicidade.

## 2.2 Passo 2 - API de aluno

Acoes:
- manutencao da API de aluno com CRUD inicial;
- exposicao de listagem de turmas por aluno (`GET /api/v1/aluno/{id}/turmas`).

Arquivos envolvidos:
- `backend/src/main/java/br/com/ilumina/controller/Aluno/AlunoController.java`
- `backend/src/main/java/br/com/ilumina/service/Aluno/AlunoService.java`

Resultado:
- frontend de aluno consegue consultar o proprio backlog de turmas.

## 2.3 Passo 3 - API de matriculas em turma

Acoes:
- criacao/ajuste dos endpoints de matricula:
  - `POST /api/v1/turmas/{id}/matriculas`
  - `DELETE /api/v1/turmas/{id}/matriculas/{alunoId}`
  - `GET /api/v1/turmas/{id}/matriculas`
  - `GET /api/v1/turmas/{id}/matriculas/publico`
- substituicao do contrato antigo com `/alunos` por `/matriculas`.

Arquivos envolvidos:
- `backend/src/main/java/br/com/ilumina/controller/Turma/TurmaController.java`
- `backend/src/main/java/br/com/ilumina/service/Turma/TurmaService.java`
- `backend/src/main/java/br/com/ilumina/dto/turma/TurmaAlunoVinculoRequest.java`

Resultado:
- contrato semantico mais claro para frontend e operacao de matricula.

## 2.4 Passo 4 - autorizacao e seguranca

Acoes:
- liberacao de `ROLE_ALUNO` para `GET /api/v1/turmas`;
- regra de auto-matricula: aluno so matricula o proprio `alunoId`;
- publicacao de endpoint sem JWT para listagem publica de alunos por turma.

Arquivo envolvido:
- `backend/src/main/java/br/com/ilumina/security/SecurityConfig.java`

Resultado:
- cobertura de cenarios autenticados e publicos sem quebrar isolamento por papel.

## 2.5 Passo 5 - testes de integracao

Acoes:
- ajuste de testes para novo path `/matriculas`;
- novos cenarios para:
  - aluno listar turmas;
  - aluno auto-matricular;
  - aluno nao matricular outro aluno;
  - endpoint publico sem autenticacao.

Arquivos envolvidos:
- `backend/src/test/java/br/com/ilumina/controller/Turma/TurmaControllerIntegrationTest.java`
- `backend/src/test/java/br/com/ilumina/controller/Aluno/AlunoControllerIntegrationTest.java`

Resultado:
- validacao ponta a ponta de regras de contrato, negocio e seguranca.

## 3. Regras de negocio consolidadas na etapa

- turma inativa nao aceita novas matriculas;
- matricula duplicada e bloqueada;
- professor precisa estar vinculado para gerir matricula da turma;
- aluno so opera em seu proprio identificador no endpoint de matricula;
- listagem publica retorna alunos da turma sem exigir token.

## 4. Evidencia de validacao

Rodada final de testes registrada:
- AlunoControllerIntegrationTest: 14/0/0;
- ProfessorControllerIntegrationTest: 13/0/0;
- TurmaControllerIntegrationTest: 37/0/0;
- IluminaBackendApplicationTests: 1/0/0;
- consolidado: 65 testes, 0 falhas, 0 erros.

## 5. Saidas documentais da etapa

- API frontend-oriented: `docs/api/2026-04-07-api-modulo-aluno-turma-matriculas.md`
- Arquitetura atualizada: `docs/arquitetura/2026-04-07-estado-atual-do-sistema-modulo-aluno-turma.md`
- Etapa mecanica: `docs/etapas/2026-04-07-07-modulo-aluno-turma-matriculas.md`

## 6. Resultado da etapa

Etapa concluida com sucesso:
- modulo aluno-turma operacional;
- contrato de matriculas estabilizado;
- endpoint publico entregue;
- testes de regressao verdes.
