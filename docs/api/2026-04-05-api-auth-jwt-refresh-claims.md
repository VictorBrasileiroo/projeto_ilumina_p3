# API - Auth JWT com Refresh e Claims

Data: 2026-04-05  
Versao: v1  
Base path: `/api/v1/auth`

## 1. Objetivo

Documentar os endpoints de autenticacao com retorno de access token, refresh token e metadados de perfil.

## 2. Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

## 3. Contratos

## 3.1 RegisterRequest

```json
{
  "name": "Testando",
  "email": "i@i.com",
  "password": "123456",
  "role": "PROFESSOR"
}
```

## 3.2 LoginRequest

```json
{
  "email": "i@i.com",
  "password": "123456"
}
```

## 3.3 RefreshTokenRequest

```json
{
  "refreshToken": "<refresh-token>"
}
```

## 3.4 AuthResponse

```json
{
  "token": "<access-token>",
  "refreshToken": "<refresh-token>",
  "type": "Bearer",
  "userId": "3f4146f1-1f69-4685-a598-2bc3c0c68eb4",
  "professorId": "0e729069-7ef0-4d75-a9e2-cf97d2108fac",
  "alunoId": null,
  "name": "Testando",
  "email": "i@i.com",
  "roles": ["ROLE_PROFESSOR"]
}
```

Observacao:
- `professorId` e `alunoId` sao contextuais; podem vir `null` se o perfil nao existir para o usuario.

## 4. Claims dos tokens

## 4.1 Access token

Claims esperadas:
- `sub` (email)
- `tokenType=access`
- `userId`
- `roles`
- `professorId` (quando existir)
- `alunoId` (quando existir)
- `iat`
- `exp`

## 4.2 Refresh token

Claims esperadas:
- `sub` (email)
- `tokenType=refresh`
- `userId`
- `iat`
- `exp`

## 5. Fluxo recomendado

1. Login/register retorna access + refresh.
2. Front usa access token nas rotas protegidas.
3. Ao receber `401` por expiracao, chama refresh.
4. Refresh retorna novo access + novo refresh.
5. Front substitui ambos e continua navegacao.

## 6. Exemplos de uso

## 6.1 Login

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"i@i.com",
    "password":"123456"
  }'
```

## 6.2 Refresh

```bash
curl -X POST "http://localhost:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken":"<refresh-token>"
  }'
```

## 6.3 Chamada protegida com access token

```bash
curl -X GET "http://localhost:8080/api/v1/professor/{id}" \
  -H "Authorization: Bearer <access-token>"
```

## 7. Erros comuns

- `400 Bad Request`: payload invalido.
- `401 Unauthorized`: credenciais invalidas, refresh token invalido/expirado, ou access token expirado.
- `403 Forbidden`: token valido sem permissao para a operacao.

## 8. Configuracao de expiracao

Config atual no backend:
- access token: `jwt.expiration` (default 86400000 ms = 24h)
- refresh token: `jwt.refresh-expiration` (default 604800000 ms = 7 dias)
