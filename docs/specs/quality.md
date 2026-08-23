# [NOME_DO_PROJETO] — quality.md

## Métricas de Qualidade e Cobertura
- Cobertura mínima de testes unitários: 80% das regras de negócio.
- Cobertura de testes de integração para fluxos críticos e banco de dados.
- Complexidade ciclomática mantida baixa (funções com responsabilidade única).

## Padrões de Código e Linter
- TypeScript `strict: true` / Python PEP 8 + tipagem / Java / C# tipado.
- Lint e formatação automatizados no commit/save (`post-edit-format`).
- Sem warnings de linter permitidos no build final.

## Testes Automatizados
- Pirâmide de testes: Testes Unitários > Testes de Integração > Testes E2E.
- Testes determinísticos: sem dependência de estado compartilhado ou ordem de execução.
- Mocks apenas para integrações externas e fronteiras do sistema.
