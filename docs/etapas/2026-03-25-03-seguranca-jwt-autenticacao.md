# Etapa 07: Seguranca com JWT e autenticacao

Data: 2026-03-25  
Ordem: 03  
Contexto: implantacao do fluxo de autenticacao stateless com JWT, login/cadastro e seed inicial de perfis

## 1. Dependencias JWT no build

Arquivo: `backend/pom.xml`

Foi adicionado o stack JWT com JJWT:
- `jjwt-api` (compilacao)
- `jjwt-impl` (runtime)
- `jjwt-jackson` (runtime)

Objetivo:
- habilitar geracao e validacao de token assinado para autenticar requisicoes sem sessao servidor.

## 2. Propriedades de JWT na configuracao

Arquivo: `backend/src/main/resources/application.yaml`

Foi adicionado bloco:
- `jwt.secret`
- `jwt.expiration`

Objetivo:
- externalizar segredo e expiracao do token por variavel de ambiente, mantendo fallback para dev.

## 3. Binding tipado das propriedades

Arquivo: `backend/src/main/java/br/com/ilumina/config/JwtProperties.java`

Foi criado `record` com `@ConfigurationProperties(prefix = "jwt")` para mapear:
- `secret`
- `expiration`

Arquivo de habilitacao:
- `backend/src/main/java/br/com/ilumina/IluminaBackendApplication.java`

Foi habilitado:
- `@EnableConfigurationProperties(JwtProperties.class)`

Objetivo:
- evitar leitura manual de propriedades e centralizar configuracao JWT em componente tipado.

## 4. Integracao de usuario com Spring Security

Arquivo: `backend/src/main/java/br/com/ilumina/security/CustomUserDetailsService.java`

Responsabilidades implementadas:
- busca usuario por email no `UserRepository`.
- converte roles do usuario em `SimpleGrantedAuthority`.
- monta `UserDetails` com senha criptografada e status ativo do usuario.

Objetivo:
- permitir que o `AuthenticationManager` autentique credenciais reais do banco.

## 5. Servico de token

Arquivo: `backend/src/main/java/br/com/ilumina/security/JwtTokenService.java`

Responsabilidades implementadas:
- gerar token JWT com subject (email) e claim `roles`.
- extrair username do token.
- validar token (subject + expiracao).
- assinar com chave HMAC derivada de `jwt.secret`.

Objetivo:
- encapsular toda regra de emissao e validacao de JWT em um unico servico.

## 6. Filtro JWT na cadeia de seguranca

Arquivo: `backend/src/main/java/br/com/ilumina/security/JwtAuthenticationFilter.java`

Comportamento:
- intercepta requisicao.
- le header `Authorization` no formato `Bearer <token>`.
- extrai usuario do token e carrega `UserDetails`.
- valida token.
- popula o `SecurityContextHolder` com autenticacao.

Objetivo:
- autenticar a requisicao em cada chamada sem uso de sessao HTTP.

## 7. Ajustes no SecurityConfig

Arquivo: `backend/src/main/java/br/com/ilumina/security/SecurityConfig.java`

Ajustes relevantes:
- manteve politica stateless.
- registrou `DaoAuthenticationProvider` com `UserDetailsService` + `PasswordEncoder`.
- registrou `AuthenticationManager`.
- adicionou `JwtAuthenticationFilter` antes de `UsernamePasswordAuthenticationFilter`.
- liberou `/api/v1/auth/**` junto das rotas publicas ja existentes.

Objetivo:
- plugar autenticacao JWT na infraestrutura de seguranca que ja estava pronta.

## 8. DTOs de autenticacao

Arquivos:
- `backend/src/main/java/br/com/ilumina/dto/auth/LoginRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/auth/RegisterRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/auth/AuthResponse.java`

Resumo:
- `LoginRequest`: email + senha.
- `RegisterRequest`: nome, email, senha e role.
- `AuthResponse`: token, tipo, dados do usuario e papeis.

Objetivo:
- padronizar contrato de entrada/saida do modulo de autenticacao.

## 9. Servico de autenticacao

Arquivo: `backend/src/main/java/br/com/ilumina/service/Auth/AuthSeervice.java`

Responsabilidades implementadas:
- `register`:
  - valida email unico.
  - normaliza role para padrao `ROLE_*`.
  - busca role no `RoleRepository`.
  - cria usuario com senha criptografada e `active = true`.
  - gera token e devolve `AuthResponse`.
- `login`:
  - autentica credenciais via `AuthenticationManager`.
  - recarrega usuario por email.
  - gera token e devolve `AuthResponse`.

Objetivo:
- concentrar regras de cadastro/login e emissao de token em uma unica camada de aplicacao.

## 10. Controller de autenticacao

Arquivo: `backend/src/main/java/br/com/ilumina/controller/Auth/AuthController.java`

Endpoints implementados:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

Objetivo:
- expor API inicial de autenticacao para o frontend/cliente.

## 11. Seed inicial de papeis

Arquivo: `backend/src/main/java/br/com/ilumina/service/Seed/DataInitializerRole.java`

Comportamento:
- ao subir a aplicacao, garante existencia das roles:
  - `ROLE_ADMIN`
  - `ROLE_PROFESSOR`
  - `ROLE_ALUNO`

Objetivo:
- preparar base minima de autorizacao por perfil para os fluxos iniciais do sistema.

## 12. Relacao com modelagem existente

Arquivos base:
- `backend/src/main/java/br/com/ilumina/entity/User/User.java`
- `backend/src/main/java/br/com/ilumina/entity/User/UserRole.java`

Como se conecta:
- `User` permanece como identidade de autenticacao.
- `UserRole` alimenta authorities no token e no contexto de seguranca.
- a tabela de juncao `users_roles` sustenta multiplos papeis por usuario.

## 13. Resultado funcional desta etapa

A aplicacao passa a ter:
- cadastro de usuario com role existente e senha criptografada.
- login por email/senha com retorno de JWT.
- autenticacao automatica por token nas rotas protegidas.
- persistencia inicial de perfis obrigatorios para autorizacao futura.

## 14. Pontos de atencao da implementacao atual

1. Nome de classe/arquivo de servico:
- atual: `AuthSeervice` em `AuthSeervice.java`.
- recomendacao: padronizar para `AuthService` para evitar ruido de manutencao.

2. Binding de request no controller:
- os metodos de `AuthController` nao estao anotados com `@RequestBody` e `@Valid`.
- sem isso, validacoes dos DTOs podem nao ser aplicadas como esperado em JSON body.

3. Import nao utilizado no servico:
- `org.apache.catalina.Role` aparece importado em `AuthSeervice` e nao e usado.

4. Segredo JWT em dev:
- manter secret com tamanho forte (>= 32 bytes) e nunca expor segredo real fora de variavel de ambiente.

## Resumo da etapa

Esta etapa conclui a base de autenticacao JWT do backend:
- infraestrutura de token implementada;
- cadeia de seguranca atualizada com filtro JWT;
- endpoints de cadastro/login disponiveis;
- seed de roles criada para viabilizar autorizacao por perfil nas proximas entregas.
