Resumo executivo do backend, incluindo tecnologias utilizadas, arquitetura e principais funcionalidades implementadas.

## Estrutura de Pastas e Papel de Cada Camada

- `config` → configurações do Spring, CORS, beans, OpenAPI, etc.
- `controller` → endpoints REST
- `service` → regras de negócio
- `repository` → acesso ao banco com JPA
- `entity` → entidades persistidas
- `dto` → objetos de entrada e saída
- `exception` → exceções e tratamento global
- `security` → JWT, filtros, config de segurança
- `integration` → comunicação com serviços externos, como a LLM
- `mapper` → conversão entre entity e dto
- `util` → helpers reutilizáveis e utilitários simples
