# Estado Atual do Sistema - Ilumina

Data da varredura: 2026-04-04  
Escopo analisado: workspace completo (backend, frontend e documentacao)

## 1. Resumo Executivo

O projeto Ilumina esta organizado em tres macroareas:
- backend: API REST em Spring Boot, com autenticacao JWT, persistencia em PostgreSQL e endpoint de health.
- frontend: ainda sem implementacao de codigo (somente arquivo README).
- docs: documentacao de processo, guias de fluxo Git/PR e historico de etapas de implementacao tecnica.

No estado atual, o backend representa praticamente 100% da implementacao funcional do sistema.

## 2. Estrutura do Repositorio

Estrutura atual do workspace:
- README.md (visao geral do monorepo)
- backend/
- frontend/
- docs/
- .github/ (somente .gitkeep, sem pipeline CI/CD implementada)

Status por pasta:
- backend: implementado e funcional em termos de codigo-base principal.
- frontend: apenas estrutura inicial documental.
- docs: parcialmente preenchido, com foco em etapas tecnicas ja realizadas.

## 3. Stack Tecnologica Atual

### 3.1 Backend

- Linguagem: Java 21
- Framework: Spring Boot 3.5.12
- Build: Maven Wrapper (mvnw/mvnw.cmd)
- Persistencia: Spring Data JPA + Hibernate
- Banco: PostgreSQL
- Seguranca: Spring Security + JWT (JJWT 0.12.6)
- Validacao: Jakarta Validation
- API docs: springdoc-openapi (Swagger UI)
- Observabilidade basica: Spring Boot Actuator

Dependencias principais observadas no pom.xml:
- spring-boot-starter-web
- spring-boot-starter-security
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- spring-boot-starter-actuator
- springdoc-openapi-starter-webmvc-ui
- postgresql
- jjwt-api / jjwt-impl / jjwt-jackson
- lombok
- spring-boot-starter-test
- spring-security-test

### 3.2 Infra local

Arquivo docker-compose presente para PostgreSQL local com:
- volume persistente postgres_data
- healthcheck via pg_isready
- variaveis de ambiente para DB, usuario e senha

## 4. Arquitetura de Codigo do Backend

Pacote raiz: br.com.ilumina

### 4.1 Camadas e responsabilidades

- config
  - configuracao de CORS
  - auditoria JPA
  - bind tipado de propriedades JWT

- controller
  - Auth/AuthController: endpoints de login e cadastro
  - Suport/HealthController: endpoint de saude da API

- dto
  - auth: LoginRequest, RegisterRequest, AuthResponse
  - shared: ApiResponse padronizado

- entity
  - BaseEntity com id UUID + auditoria temporal
  - User e UserRole no modulo de identidade/autorizacao

- repository
  - UserRepository
  - RoleRepository

- service
  - Auth/AuthSeervice: regras de cadastro/login e emissao de token
  - Seed/DataInitializerRole: seed inicial de papeis

- security
  - SecurityConfig
  - JwtAuthenticationFilter
  - JwtTokenService
  - CustomUserDetailsService
  - handlers REST para 401 e 403

- exception
  - GlobalExceptionHandler
  - BusinessException
  - ResourceNotFoundException

### 4.2 Pacotes existentes sem implementacao funcional

Pacotes com placeholder (.gitkeep):
- integration
- mapper
- util

Leitura pratica: a arquitetura ja preve expansao, mas essas camadas ainda nao possuem codigo de negocio implementado.

## 5. Configuracao da Aplicacao

### 5.1 application.yaml

Configuracoes observadas:
- spring.application.name = ilumina-backend
- profile ativo padrao = dev
- server.port = 8080
- paths de OpenAPI/Swagger ativos
- management endpoints expostos: health, info
- bloco jwt com secret e expiration

### 5.2 application-dev.yml

Configuracao de ambiente dev:
- datasource PostgreSQL por variavel de ambiente com fallback local
- hibernate.ddl-auto = update
- open-in-view = false
- show-sql = true
- SQL formatado + timezone UTC
- actuator health com show-details = always

### 5.3 Variaveis de ambiente

Arquivo .env.example define:
- DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
- JWT_SECRET_KEY
- JWTT_EXPIRATION

Observacao importante de consistencia:
- application.yaml usa JWT_SECRET e JWT_EXPIRATION.
- .env.example usa JWT_SECRET_KEY e JWTT_EXPIRATION.

Conclusao: existe divergencia de nomes entre configuracao e exemplo de ambiente. Isso pode gerar uso involuntario de valores default de JWT em runtime.

## 6. Modelo de Dominio e Persistencia

### 6.1 BaseEntity

Campos comuns herdados:
- id (UUID)
- createdAt
- updatedAt

Auditoria ativada por JpaAuditingConfig com DateTimeProvider baseado em OffsetDateTime.now().

### 6.2 Entidades de identidade

User:
- name
- email (unico)
- password
- active
- roles (ManyToMany EAGER)

UserRole:
- name (unico)
- description

Relacionamento:
- tabela users
- tabela user_role
- tabela de juncao users_roles

### 6.3 Repositorios

UserRepository:
- findByEmail
- existsByEmail

RoleRepository:
- findUserRoleByName

## 7. Seguranca, Autenticacao e Autorizacao

### 7.1 Security policy (SecurityConfig)

Politica atual:
- CSRF desabilitado
- CORS habilitado por bean dedicado
- sessao stateless
- filtro JWT inserido antes de UsernamePasswordAuthenticationFilter
- autenticacao via DaoAuthenticationProvider + BCrypt

Rotas publicas:
- /api/v1/health/**
- /api/v1/auth/**
- /actuator/health
- /actuator/info
- /v3/api-docs/**
- /swagger-ui/**
- /swagger-ui.html
- OPTIONS em qualquer rota

Demais rotas:
- exigem autenticacao

### 7.2 CORS

Origens permitidas:
- http://localhost:3000
- http://localhost:5173
- http://localhost:4200

Metodos permitidos:
- GET, POST, PUT, PATCH, DELETE, OPTIONS

Headers permitidos:
- Authorization, Content-Type, Accept

### 7.3 Fluxo JWT implementado

Fluxo de autenticacao atual:
1. Cliente chama login/cadastro.
2. Backend autentica/valida credenciais.
3. JwtTokenService gera token com subject (email) e claim roles.
4. Requisicoes protegidas enviam Authorization: Bearer <token>.
5. JwtAuthenticationFilter valida token e popula SecurityContext.

Handlers de seguranca:
- 401: RestAuthenticationEntryPoint (nao autenticado)
- 403: RestAccessDeniedHandler (sem permissao)

## 8. Endpoints Disponiveis no Estado Atual

### 8.1 Health

GET /api/v1/health
- autenticacao: nao
- retorno: ApiResponse de sucesso com status UP e service ilumina-backend

### 8.2 Autenticacao

POST /api/v1/auth/register
- autenticacao: nao
- entrada esperada: nome, email, senha, role
- saida: AuthResponse com token e dados do usuario

POST /api/v1/auth/login
- autenticacao: nao
- entrada esperada: email, senha
- saida: AuthResponse com token e dados do usuario

Observacao tecnica:
- os metodos do AuthController atualmente nao usam @RequestBody e @Valid nos parametros.
- impacto: contratos de validacao dos DTOs podem nao ser aplicados como esperado para payload JSON.

## 9. Padrao de Resposta e Tratamento de Excecao

### 9.1 Contrato ApiResponse

Formato padronizado:
- timestamp
- status
- success
- message
- data
- errors
- path

Metodos de fabrica:
- ApiResponse.sucess(...)
- ApiResponse.error(...)

### 9.2 GlobalExceptionHandler

Tratamentos dedicados para:
- ResourceNotFoundException -> 404
- BusinessException -> 400
- MethodArgumentNotValidException -> 400
- ConstraintViolationException -> 400
- IllegalArgumentException -> 400
- AuthenticationException -> 401
- Exception generica -> 500

## 10. Inicializacao de Dados

DataInitializerRole (CommandLineRunner) garante no startup:
- ROLE_ADMIN
- ROLE_PROFESSOR
- ROLE_ALUNO

Efeito pratico:
- base minima de papeis para cadastro/autenticacao sem necessidade de carga manual inicial.

## 11. Testes e Estado de Qualidade Atual

### 11.1 Testes existentes

Suite atual identificada:
- IluminaBackendApplicationTests (contextLoads)

Nao foram identificados testes de:
- controller (WebMvcTest)
- service
- repository
- seguranca (cenarios 401/403 e JWT)
- testes de integracao fim a fim

### 11.2 Resultado da execucao real de testes

Execucao realizada: backend/mvnw.cmd test

Resultado:
- Tests run: 1
- Failures: 0
- Errors: 1
- BUILD FAILURE

Causa principal da falha:
- falha ao subir ApplicationContext de teste por ausencia de metadata JDBC suficiente para determinar Dialect.

Leitura tecnica:
- nao ha perfil de teste isolado com banco em memoria (ex.: H2) nem override explicito de datasource para testes locais.

### 11.3 Achados de analise estatica/IDE

Itens encontrados:
- imports nao utilizados em algumas classes
- avisos de anotacao non-null em metodo sobrescrito do filtro JWT
- avisos Lombok sobre equals/hashCode em classes que herdam BaseEntity
- uso de construtor/metodo deprecated de DaoAuthenticationProvider
- alerta de propriedade jwt nao reconhecida (metadata de configuracao)
- alertas de chaves YAML com ponto sem escape em mapas

Observacao:
- parte dos itens acima e warning de analise (qualidade/manutenibilidade) e nao necessariamente erro de compilacao impeditivo.

## 12. Documentacao Existente no Projeto

Conteudos ja presentes:
- docs/etapas/2026-03-24-01-seguranca-cors-health-apiresponse.md
- docs/etapas/2026-03-25-02-modelo-usuario-auditoria-repositorios.md
- docs/etapas/2026-03-25-03-seguranca-jwt-autenticacao.md
- docs/guias/01-Guia-Branches.md
- docs/guias/02-Template-PR.md

Pastas ainda vazias (apenas .gitkeep):
- docs/api
- docs/arquitetura (este documento passa a preencher esta area)
- docs/atas
- docs/diagramas
- docs/features

## 13. Estado do Frontend

Estado atual:
- pasta frontend contem apenas README sem codigo de aplicacao.

Conclusao:
- nao ha interface implementada nem integracao frontend-backend no repositorio atual.

## 14. Estado de CI/CD e Governanca Tecnica

- .github/workflows nao contem pipelines configuradas (somente .gitkeep).
- ha guia de boas praticas de branch/PR em docs/guias.
- nao foi identificado pipeline automatico de build/test/lint/deploy no estado atual.

## 15. Maturidade Atual por Eixo

### 15.1 Arquitetura backend
- nivel: inicial para intermediario
- observacao: fundacao de seguranca/autenticacao e padrao de resposta ja estabelecida.

### 15.2 Dominio de negocio
- nivel: inicial
- observacao: dominio implementado no momento e essencialmente identidade/autenticacao.

### 15.3 Qualidade automatizada
- nivel: inicial
- observacao: cobertura de testes muito baixa e teste existente falhando por setup de ambiente.

### 15.4 Operacao/entrega
- nivel: inicial
- observacao: docker-compose local existe, mas sem pipeline CI/CD operacional.

### 15.5 Documentacao tecnica
- nivel: inicial para intermediario
- observacao: ha bom historico de etapas; faltam especificacoes de API, diagramas e inventario arquitetural consolidado (este documento cobre parte dessa lacuna).

## 16. Riscos Tecnicos Prioritarios

1. Divergencia de variaveis JWT entre configuracao e .env.example.
2. Validacao de DTO possivelmente nao aplicada como esperado nos endpoints de auth sem @RequestBody/@Valid.
3. Testes quebrando por acoplamento ao ambiente de banco sem perfil de teste adequado.
4. Ausencia de CI/CD reduz feedback rapido sobre regressao.
5. Frontend ainda nao implementado no repositorio.

## 17. Conclusao Geral

O sistema encontra-se em uma fase de base estrutural de backend bem definida, com seguranca JWT, persistencia JPA, tratamento global de erros e endpoints iniciais de autenticacao e health ja implementados.

Ao mesmo tempo, o projeto ainda esta em estado inicial de produto completo: frontend ausente, automacao de testes insuficiente, falha no teste de contexto por setup de banco e ausencia de pipeline CI/CD.

Em resumo:
- base tecnica do backend: pronta para evoluir.
- maturidade de produto ponta-a-ponta: ainda em construcao.
