# Etapa: Modelo de usuario, auditoria e repositorios

Data: 2026-03-25  
Ordem: 02  
Contexto: ajuste de ambiente dev + modelagem inicial de usuario/perfil com persistencia JPA

## 1. Mudanca no arquivo dev (application-dev.yml)

Arquivo: `backend/src/main/resources/application-dev.yml`

Observacao:
- O arquivo citado como propriete-dev.yml foi identificado no projeto como `application-dev.yml`.

Pontos configurados:
- Datasource PostgreSQL com variaveis de ambiente e fallback local:
  - host: `${DB_HOST:localhost}`
  - porta: `${DB_PORT:5432}`
  - banco: `${DB_NAME:ilumina_db}`
  - usuario: `${DB_USERNAME:ilumina_user}`
  - senha: `${DB_PASSWORD:ilumina_pass}`
- Hibernate com `ddl-auto: update` para evolucao automatica do schema no dev.
- `open-in-view: false` para evitar acesso lazy fora da camada transacional web.
- SQL visivel no dev:
  - `show-sql: true`
  - `format_sql: true`
  - `org.hibernate.SQL: DEBUG`
- Fuso JDBC em UTC (`hibernate.jdbc.time_zone: UTC`).
- `sql.init.mode: never` para nao executar init SQL automatico.
- Actuator health com detalhes habilitados (`show-details: always`).

Impacto pratico:
- Facilita desenvolvimento local e diagnostico de query.
- Mantem configuracao mais previsivel para datas/hora e comportamento JPA.

## 2. BaseEntity

Arquivo: `backend/src/main/java/br/com/ilumina/entity/BaseEntity.java`

Papel na arquitetura:
- Classe base compartilhada para entidades do dominio.
- Evita duplicacao de campos comuns entre tabelas.

Campos herdados por todas as entidades filhas:
- `id` (UUID gerado automaticamente)
- `createdAt` (preenchido na criacao)
- `updatedAt` (preenchido na atualizacao)

Detalhes importantes:
- `@MappedSuperclass`: nao cria tabela propria; apenas injeta colunas nas entidades concretas.
- `@EntityListeners(AuditingEntityListener.class)`: ativa mecanismo de auditoria do Spring Data.
- `createdAt` e imutavel apos criacao (`updatable = false`).

Beneficio:
- Padroniza identidade e trilha temporal das entidades desde o inicio do projeto.

## 3. JpaAuditingConfig (para que serve)

Arquivo: `backend/src/main/java/br/com/ilumina/config/JpaAuditingConfig.java`

Responsabilidade:
- Habilitar auditoria JPA com `@EnableJpaAuditing`.

Para que serve na pratica:
- Permite que anotacoes como `@CreatedDate` e `@LastModifiedDate` funcionem automaticamente.
- Sem essa configuracao, os campos de auditoria da `BaseEntity` nao seriam preenchidos pelo framework.

Resultado:
- Sempre que uma entidade for inserida/atualizada via JPA, os timestamps sao gerenciados automaticamente.

## 4. UserRole (como vai funcionar depois e por que)

Arquivo: `backend/src/main/java/br/com/ilumina/entity/User/UserRole.java`

Papel atual:
- Representa perfis/papeis de acesso da aplicacao (ex.: ADMIN, USER, etc.).
- Guarda `name` unico e `description` opcional.

Como vai funcionar posteriormente:
- No fluxo de autenticacao/autorizacao, os papeis associados ao usuario serao convertidos em authorities do Spring Security.
- Regras de acesso poderao usar esse papel em filtros e anotacoes (ex.: `@PreAuthorize`).
- O nome unico do papel facilita lookup por regra e evita duplicidade semantica.

Por que essa separacao e importante:
- Permite evoluir autorizacao sem acoplar regra de negocio diretamente na entidade `User`.
- Deixa o sistema pronto para multiplos papeis por usuario.

## 5. User (explicacao dos joins)

Arquivo: `backend/src/main/java/br/com/ilumina/entity/User/User.java`

Papel atual:
- Entidade principal de conta de usuario.
- Campos principais: `name`, `email` (unico), `password`, `status`.

Relacao com UserRole:
- `@ManyToMany(fetch = FetchType.EAGER)`
- Tabela de juncao: `users_roles`
- Coluna de referencia do usuario: `user_id`
- Coluna de referencia do papel: `role_id`

Como os joins funcionam:
- Banco:
  - tabela `users` guarda dados basicos do usuario
  - tabela `user_role` guarda catalogo de papeis
  - tabela `users_roles` liga N usuarios a N papeis
- Aplicacao:
  - ao carregar `User`, o JPA traz tambem o conjunto `roles` (EAGER)
  - isso facilita autorizacao imediata no ciclo de login e validacao de acesso

Observacao de design:
- O fetch EAGER ajuda no inicio para seguranca, mas em cenarios grandes pode aumentar custo de consulta.
- Se necessario no futuro, pode migrar para LAZY + query especifica com fetch join.

## 6. Ambos os repositories

### 6.1 UserRepository
Arquivo: `backend/src/main/java/br/com/ilumina/repository/User/UserRepository.java`

Recursos disponiveis:
- CRUD completo herdado de `JpaRepository<User, UUID>`.
- `findByEmail(String email)`: busca usuario por email (base para login).
- `existsByEmail(String email)`: valida duplicidade no cadastro/edicao.

### 6.2 RoleRepository
Arquivo: `backend/src/main/java/br/com/ilumina/repository/User/RoleRepository.java`

Recursos disponiveis:
- CRUD completo herdado de `JpaRepository<UserRole, UUID>`.
- `findUserRoleByName(String name)`: localiza papel por nome para atribuicao e validacao de regra.

Papel conjunto dos dois repositories:
- `UserRepository` controla identidade e dados do usuario.
- `RoleRepository` controla o catalogo de papeis.
- Juntos sustentam o fluxo futuro de autenticacao, autorizacao e administracao de contas.

## Resumo da etapa

Esta etapa prepara o backend para camada de identidade e controle de acesso:
- ambiente dev padronizado para PostgreSQL e observabilidade de query;
- auditoria automatica de entidades com base comum;
- modelagem de usuario e papel com relacao N:N por tabela de juncao;
- repositories prontos para login por email, validacao de unicidade e lookup de papeis.
