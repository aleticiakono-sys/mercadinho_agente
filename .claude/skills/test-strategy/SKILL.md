---
name: test-strategy
description: Planejamento e execução da pirâmide de testes para features novas ou refatoradas.
---

## Estratégia de Testes

1. **Testes Unitários:**
   - Foco: Regras de negócio, cálculos, validações de domínio e transformações de dados.
   - Meta: 80%+ de cobertura.
   - Execução: Ultra rápida (< 100ms por suite), sem I/O de rede ou banco real.
2. **Testes de Integração:**
   - Foco: Queries complexas de banco, migrations, rotas de API com autenticação e validação de DTOs.
   - Ambiente: Banco de teste isolado ou em memória / Testcontainers.
3. **Testes E2E:**
   - Foco: Fluxos críticos do usuário (ex: login, checkout, onboarding).
4. **Verificação de Regressão:**
   - Executar suíte completa antes de submeter PR ou considerar task concluída.
