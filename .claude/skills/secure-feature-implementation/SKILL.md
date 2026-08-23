---
name: secure-feature-implementation
description: Use sempre que implementar uma nova feature com backend, frontend, banco ou integração externa.
---

## Passos

1. Ler specs em `docs/specs/` e rules em `.claude/rules/`.
2. Mapear dados sensíveis e fluxo de dados.
3. Definir contrato de entrada e saída em `docs/specs/api-contracts.md`.
4. Definir regras de autorização no backend.
5. Implementar validação e regras de negócio no backend.
6. Implementar UX e validação visual no frontend.
7. Criar testes unitários e de integração.
8. Executar revisão de segurança (`security-reviewer`).
9. Atualizar documentação e gerar relatório em `docs/tasks/`.

## Checklist final

- [ ] Entrada validada por DTOs
- [ ] Autorização validada no nível de recurso (anti-IDOR)
- [ ] Erros padronizados sem stack trace
- [ ] Logs seguros sem PII ou segredos
- [ ] Testes automatizados criados e passando
- [ ] Dependências justificadas
- [ ] Documentação e specs atualizadas
