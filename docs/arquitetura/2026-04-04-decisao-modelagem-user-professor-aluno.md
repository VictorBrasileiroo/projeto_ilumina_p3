# Decisao Canonica de Modelagem: User, Professor e Aluno

Data: 2026-04-04

## 1. Objetivo

Congelar a decisao de modelagem para evitar retrabalho no CRUD de professor e garantir compatibilidade com o modulo futuro de aluno e turmas.

## 2. Decisao Canonica

1. User e a identidade autenticavel unica do sistema.
2. Professor e um perfil de dominio vinculado a User em relacao 1:1.
3. Aluno e um perfil de dominio vinculado a User em relacao 1:1.
4. Roles continuam em User (relacao N:N com UserRole).
5. Credenciais e seguranca ficam somente em User (email, senha, active, roles).
6. Dados funcionais de Professor e Aluno ficam em suas proprias entidades.

Essa decisao impede duplicacao de credenciais e separa identidade (auth) de dados de negocio (perfil academico).

## 3. Modelo de Relacionamento

Relacoes recomendadas:

- users (1) <-> (0..1) professores
- users (1) <-> (0..1) alunos
- users (N) <-> (N) user_role

Leitura pratica:
- todo professor tem um user.
- todo aluno tem um user.
- um user pode existir sem perfil de professor/aluno (exemplo: admin tecnico).
- um user pode, se o negocio permitir, ter os dois perfis (professor e aluno) sem conflito tecnico.

## 4. Responsabilidade de Campos

User:
- id
- name
- email (unico global)
- password (hash)
- active
- roles
- createdAt/updatedAt

Professor (perfil):
- user_id (FK unica para users)
- disciplina principal
- sexo/genero
- campos academicos/operacionais especificos do professor

Aluno (perfil futuro):
- user_id (FK unica para users)
- matricula (unica)
- sexo/genero
- outros campos pedagogicos especificos de aluno

Regra central:
- nao duplicar email/senha em Professor nem em Aluno.

## 5. Invariantes de Dominio

1. Email e unico no contexto de User.
2. Login sempre ocorre por User.
3. Roles determinam permissao; perfil determina dados de negocio.
4. Professor sem ROLE_PROFESSOR e inconsistente.
5. Aluno sem ROLE_ALUNO e inconsistente.
6. Exclusao logica preferencial (desativacao) para preservar historico.

## 6. Semantica de Desativacao (Decisao)

Desativar professor/aluno deve desativar o User vinculado (active = false).

Efeitos esperados:
- bloqueia autenticacao imediatamente.
- remove da listagem padrao de ativos (com opcao de filtro para inativos).
- preserva vinculos historicos (turmas, provas, colecoes e auditoria).

Nao realizar delete fisico em entidades centrais de identidade/perfil.

## 7. Compatibilidade com Turmas (Futuro)

Decisao de encaixe:

1. Relacao Professor <-> Turma deve nascer como N:N.
2. Relacao Aluno <-> Turma deve considerar historico temporal.

Recomendacao para Aluno <-> Turma:
- usar entidade associativa (exemplo: MatriculaTurma) caso seja necessario armazenar ano/periodo/status.

Referencias futuras:
- provas e colecoes devem referenciar Professor (perfil de dominio), nao apenas User, para manter semantica do negocio.

## 8. Contrato Operacional para o CRUD de Professor

Criacao de professor:
1. criar User com ROLE_PROFESSOR.
2. criar Professor vinculado ao User criado.
3. executar em transacao unica.

Edicao de professor:
- campos de identidade (name/email/active) atualizam User.
- campos de perfil atualizam Professor.

Desativacao:
- altera active de User para false.
- perfil permanece persistido.

## 9. Matriz de Permissao Minima (Primeiro Corte)

- criar professor: ROLE_ADMIN
- listar professores: ROLE_ADMIN (e opcionalmente ROLE_PROFESSOR para leitura controlada)
- detalhar professor: ROLE_ADMIN ou o proprio professor
- editar professor: ROLE_ADMIN ou o proprio professor (restrito ao proprio perfil)
- desativar professor: ROLE_ADMIN

Observacao:
- qualquer acesso indevido deve retornar 403, reaproveitando infraestrutura de seguranca ja existente.

## 10. O que Esta Explicitamente Respondido

Duvida principal resolvida:
- Professor nao substitui User e nao deve duplicar credenciais.
- Professor e extensao 1:1 de User para dados de dominio.

Duvida de futuro (Aluno):
- Aluno segue o mesmo padrao de extensao 1:1 sobre User.
- isso padroniza auth e reduz custo de manutencao.

Duvida de evolucao para turmas:
- o modelo acima ja nasce compativel com N:N para professor-turma e com historico academico de aluno.
