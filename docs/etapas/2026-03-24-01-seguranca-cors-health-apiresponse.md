# Etapa: Seguranca, CORS, Health e ApiResponse

Data: 2026-03-24  
Ordem: 01  
Contexto: configuracao base de seguranca, CORS, health check e padrao de resposta da API

## 1. Arquivos de seguranca

### 1.1 SecurityConfig
Arquivo: `backend/src/main/java/br/com/ilumina/security/SecurityConfig.java`

Responsabilidades principais:
- Define a cadeia de seguranca da aplicacao (`SecurityFilterChain`).
- Desativa `csrf`, `httpBasic` e `formLogin`.
- Habilita CORS com a configuracao padrao do bean de CORS.
- Configura sessao como stateless (`SessionCreationPolicy.STATELESS`).
- Registra handlers customizados para:
  - autenticacao nao realizada (`RestAuthenticationEntryPoint`)
  - acesso negado por autorizacao (`RestAccessDeniedHandler`)
- Libera rotas publicas:
  - `/api/v1/health/**`
  - `/actuator/health`
  - `/actuator/info`
  - `/v3/api-docs/**`
  - `/swagger-ui/**`
  - `/swagger-ui.html`
- Libera todas as requisicoes `OPTIONS`.
- Exige autenticacao para qualquer outra rota.
- Disponibiliza bean de `PasswordEncoder` com `BCryptPasswordEncoder`.

### 1.2 RestAccessDeniedHandler
Arquivo: `backend/src/main/java/br/com/ilumina/security/RestAccessDeniedHandler.java`

Responsabilidades principais:
- Trata falhas de autorizacao (usuario autenticado sem permissao).
- Retorna HTTP `403 Forbidden` em formato JSON.
- Monta resposta padronizada com `ApiResponse.error(...)`, incluindo:
  - status
  - mensagem principal
  - lista de erros
  - caminho da requisicao (`requestURI`)
- Serializa o corpo com `ObjectMapper`.

Mensagem padrao definida:
- "Acesso negado."
- "Voce nao tem permissao para acessar este recurso."

### 1.3 RestAuthenticationEntryPoint
Arquivo: `backend/src/main/java/br/com/ilumina/security/RestAuthenticationEntryPoint.java`

Responsabilidades principais:
- Trata falhas de autenticacao (recurso protegido sem login/token valido).
- Retorna HTTP `401 Unauthorized` em formato JSON.
- Monta resposta padronizada com `ApiResponse.error(...)`, incluindo:
  - status
  - mensagem principal
  - lista de erros
  - caminho da requisicao (`requestURI`)
- Serializa o corpo com `ObjectMapper`.

Mensagem padrao definida:
- "Nao autenticado."
- "Autenticacao e obrigatoria para acessar este recurso."

## 2. Arquivo de CORS (config)

### 2.1 CorsConfig
Arquivo: `backend/src/main/java/br/com/ilumina/config/CorsConfig.java`

Responsabilidades principais:
- Define o bean `CorsConfigurationSource` usado pela seguranca.
- Configura origens permitidas para ambiente local:
  - `http://localhost:3000`
  - `http://localhost:5173`
  - `http://localhost:4200`
- Configura metodos HTTP permitidos:
  - `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- Configura headers permitidos:
  - `Authorization`, `Content-Type`, `Accept`
- Expõe header `Authorization` para o cliente.
- Permite envio de credenciais (`allowCredentials = true`).
- Aplica a regra para todos os endpoints (`/**`).

## 3. Controller de health

### 3.1 HealthController
Arquivo: `backend/src/main/java/br/com/ilumina/controller/suport/HealthController.java`

Responsabilidades principais:
- Exponibiliza endpoint de health check em `GET /api/v1/health`.
- Retorna payload simples com:
  - `status = UP`
  - `service = ilumina-backend`
- Encapsula retorno no padrao `ApiResponse.sucess(...)`.
- Retorna HTTP `200 OK`.

Objetivo pratico:
- Permitir verificacao rapida de disponibilidade da API (monitoramento e diagnostico basico).

## 4. DTO compartilhado de resposta

### 4.1 ApiResponse
Arquivo: `backend/src/main/java/br/com/ilumina/dto/shared/ApiResponse.java`

Responsabilidades principais:
- Define contrato padrao de resposta para toda API via `record` generico (`ApiResponse<T>`).
- Estrutura os campos:
  - `timestamp`
  - `status`
  - `success`
  - `message`
  - `data`
  - `errors`
  - `path`
- Oferece metodos de fabrica:
  - `sucess(...)` para respostas de sucesso
  - `error(...)` para respostas de erro
- Garante preenchimento automatico do `timestamp` com `OffsetDateTime.now()`.

Beneficio:
- Mantem consistencia entre respostas de sucesso, validacao, autenticacao e autorizacao em toda a aplicacao.

## Resumo da etapa

Esta etapa consolida a base de comunicacao da API com o cliente:
- seguranca stateless com respostas JSON padronizadas para 401/403;
- politica de CORS explicita para ambientes locais;
- endpoint de health liberado para monitoramento;
- DTO unico para padronizar todos os retornos da API.
