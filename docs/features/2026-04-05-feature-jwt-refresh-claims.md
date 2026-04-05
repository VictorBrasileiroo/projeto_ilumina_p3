# Feature: Evolucao JWT com Refresh e Claims de Perfil

Data: 2026-04-05  
Status: implementado  
Escopo: backend auth + consumo frontend

## 1. Objetivo da feature

Evoluir a autenticacao para reduzir relogin frequente e facilitar o uso de contexto de usuario no frontend.

Objetivos praticos desta entrega:
- adicionar refresh token;
- enriquecer claims do access token;
- devolver metadados de perfil no payload de auth;
- manter validacao de seguranca por role no backend.

## 2. Estado anterior (antes da evolucao)

Antes desta etapa:
- login/cadastro retornavam apenas access token;
- nao existia endpoint de refresh;
- expirado o access token, usuario precisava logar novamente;
- claims eram basicas (subject/email + roles).

Impacto no front:
- experiencia de sessao pior em uso prolongado;
- mais friccao de autenticacao ao expirar token.

## 3. O que foi implementado agora

## 3.1 Novo fluxo de tokens

Agora o backend emite dois tokens:
- access token: usado no `Authorization: Bearer` para acessar APIs protegidas;
- refresh token: usado apenas no endpoint de refresh para renovar sessao.

Endpoints que passaram a retornar refresh token:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/professor` (cadastro publico do professor)

Novo endpoint:
- `POST /api/v1/auth/refresh`

## 3.2 Claims no access token

Claims atuais no access token:
- `sub`: email do usuario
- `tokenType`: `access`
- `userId`: id do usuario
- `roles`: lista de roles
- `professorId`: id do professor (quando existir)
- `alunoId`: id do aluno (quando existir; no estado atual tende a `null`)
- `iat`: data de emissao
- `exp`: data de expiracao

Claims no refresh token:
- `sub`: email do usuario
- `tokenType`: `refresh`
- `userId`
- `iat`
- `exp`

## 3.3 Validacao de tipo de token

O filtro JWT agora aceita apenas access token para rotas protegidas.

Resultado:
- refresh token nao serve para acessar endpoint de negocio;
- refresh token serve apenas para `POST /api/v1/auth/refresh`.

## 4. Diferencas praticas para o frontend

Comportamento novo:
- app pode manter usuario navegando por mais tempo sem pedir login toda hora;
- quando access token expira, front chama refresh e continua sessao;
- front recebe `userId` e `professorId` no payload de auth para usar em rotas/contexto.

## 5. Fluxo recomendado no frontend

## 5.1 Login inicial

1. Chamar login.
2. Salvar `token` (access) e `refreshToken`.
3. Salvar metadados (`userId`, `professorId`, `roles`).
4. Navegar para area autenticada.

## 5.2 Chamada de API protegida

1. Enviar `Authorization: Bearer <access-token>`.
2. Se resposta for `401` por expiracao, chamar refresh.
3. Atualizar tokens em memoria/storage.
4. Repetir request original uma unica vez.

## 5.3 Refresh

1. Chamar `POST /api/v1/auth/refresh` com `refreshToken`.
2. Receber novo access token e novo refresh token.
3. Substituir tokens antigos.

## 5.4 Logout

1. Limpar access token.
2. Limpar refresh token.
3. Limpar estado de usuario local.

## 6. Exemplo de payload de auth (resumo)

```json
{
  "token": "<access-token>",
  "refreshToken": "<refresh-token>",
  "type": "Bearer",
  "userId": "...",
  "professorId": "...",
  "alunoId": null,
  "name": "Isadora Cristina",
  "email": "i@i.com",
  "roles": ["ROLE_PROFESSOR"]
}
```

## 7. Observacoes importantes

- `alunoId` ja esta previsto no contrato, mas depende da modelagem de Aluno para ser preenchido.
- Claims ajudam o frontend no bootstrap da sessao, mas autorizacao real continua no backend.
- Frontend deve sempre tratar `401/403` e nao confiar apenas em guard visual.

## 8. Resultado da feature

Com essa evolucao:
- sessao ficou mais resiliente;
- UX de autenticacao melhorou;
- contrato JWT ficou mais rico para navegao orientada por perfil;
- base pronta para expansao de claims quando dominio Aluno estiver implementado.
