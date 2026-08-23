---
name: db-migration-safe
description: Guia de elaboração e execução segura de migrations de banco de dados com planos de rollback e mitigação de locks.
---

## Quando usar

- Ao criar novas tabelas, colunas, índices, foreign keys ou alterar constraints de banco de dados.

## Passos

1. Mapear o impacto volumétrico na tabela de destino.
2. Escrever a migration progressiva (*Expand and Contract*):
   - Nunca renomear ou remover colunas em uso na mesma versão.
   - Adicionar colunas como `NULL` ou com valor `DEFAULT` explícito.
   - Criar índices de forma concorrente quando o SGBD suportar (`CONCURRENTLY` no PostgreSQL).
3. Escrever e testar o script de rollback (down migration).
4. Validar impacto em multi-tenancy (`tenant_id`).
5. Não executar migração de produção sem aprovação humana e runbook formal.
