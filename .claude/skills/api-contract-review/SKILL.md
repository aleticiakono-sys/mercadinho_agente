---
name: api-contract-review
description: Validação e auditoria de contratos de API REST/GraphQL para conformidade de schemas, autenticação, autorização e erros padronizados.
---

## Checklist de Revisão de Contrato

1. O endpoint está registrado em `docs/specs/api-contracts.md`?
2. O método HTTP reflete a semântica correta (GET para busca, POST para criação, PUT/PATCH para atualização, DELETE para remoção)?
3. As entradas utilizam DTOs estritos com validação de formato e comprimento?
4. A resposta de sucesso utiliza DTO explícito sem expor campos internos de banco?
5. As respostas de erro utilizam códigos HTTP padronizados (400, 401, 403, 404, 409, 422, 500) com mensagens amigáveis?
6. As regras de autorização por recurso e tenant estão documentadas e aplicadas?
