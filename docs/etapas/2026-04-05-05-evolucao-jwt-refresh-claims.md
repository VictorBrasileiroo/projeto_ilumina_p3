# Etapa: Evolucao JWT com Refresh e Claims

Data: 2026-04-05  
Ordem: 05  
Contexto: evolucao do modulo de autenticacao para renovar sessao sem relogin e expor claims uteis de perfil

## 1. Objetivo da etapa

Evoluir a seguranca JWT para suportar:
- refresh token;
- claims mais completas no access token;
- retorno de metadados de perfil em login/cadastro/refresh.

## 2. Arquivos criados

## 2.1 DTO de refresh

- `backend/src/main/java/br/com/ilumina/dto/auth/RefreshTokenRequest.java`

Resultado:
- contrato de entrada para endpoint `POST /api/v1/auth/refresh`.

## 2.2 Documentacao da API de auth

- `docs/api/2026-04-05-api-auth-jwt-refresh-claims.md`

Resultado:
- contrato atualizado de login/register/refresh com exemplos.

## 2.3 Feature tecnica da evolucao JWT

- `docs/features/2026-04-05-feature-jwt-refresh-claims.md`

Resultado:
- visao funcional de antes/depois, fluxo frontend e claims.

## 2.4 Guia operacional de tokens

- `docs/guias/04.Guia-Tokens-Refresh-Claims.md`

Resultado:
- orientacoes praticas de uso de access token, refresh token e claims.

## 3. Arquivos alterados

## 3.1 Auth controller

- `backend/src/main/java/br/com/ilumina/controller/Auth/AuthController.java`

Alteracoes:
- validacao de body com `@Valid @RequestBody` nos endpoints de auth;
- novo endpoint `POST /api/v1/auth/refresh`.

## 3.2 Auth service

- `backend/src/main/java/br/com/ilumina/service/Auth/AuthSeervice.java`

Alteracoes:
- emissao de access e refresh token em login/register;
- fluxo de refresh com validacao de token e usuario ativo;
- retorno enriquecido com `userId`, `professorId`, `alunoId`, `roles`.

## 3.3 JWT service

- `backend/src/main/java/br/com/ilumina/security/JwtTokenService.java`

Alteracoes:
- geracao de access token com claims de perfil;
- geracao de refresh token dedicado;
- validacao separada por tipo (`access` x `refresh`);
- suporte a extracao de `userId` e `tokenType`.

## 3.4 JWT filter

- `backend/src/main/java/br/com/ilumina/security/JwtAuthenticationFilter.java`

Alteracao:
- filtro passou a aceitar apenas access token para autenticacao de request.

## 3.5 DTOs de resposta

- `backend/src/main/java/br/com/ilumina/dto/auth/AuthResponse.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/CreateProfessorResponse.java`

Alteracoes:
- inclusao de `refreshToken` e metadados adicionais no contrato.

## 3.6 Configuracao JWT

- `backend/src/main/java/br/com/ilumina/config/JwtProperties.java`
- `backend/src/main/resources/application.yaml`
- `backend/src/test/resources/application-test.yml`

Alteracoes:
- nova propriedade `jwt.refresh-expiration`.

## 4. Comportamento funcional consolidado

Login/Register/Create professor:
- retornam access token + refresh token.

Refresh:
- recebe refresh token;
- valida tipo/usuario/expiracao;
- retorna novo access token + novo refresh token.

Rotas protegidas:
- aceitam somente access token valido.

## 5. Claims no access token

Claims emitidas:
- `sub`
- `tokenType=access`
- `userId`
- `roles`
- `professorId` (quando existir)
- `alunoId` (quando existir)
- `iat`
- `exp`

## 6. Testes atualizados

Arquivo:
- `backend/src/test/java/br/com/ilumina/controller/Professor/ProfessorControllerIntegrationTest.java`

Cobertura adicionada:
- validacao de `refreshToken` nos retornos;
- fluxo de refresh (`/api/v1/auth/refresh`);
- validacao de claims relevantes (`userId`, `professorId`, `roles`) no token emitido.

## 7. Resultado da etapa

Etapa concluida com sucesso:
- auth com refresh token operacional;
- claims JWT mais ricas para bootstrap de sessao no frontend;
- contrato de API e testes alinhados com o novo fluxo.
