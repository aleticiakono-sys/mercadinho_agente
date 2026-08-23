---
name: dependency-audit
description: Auditoria técnica e de segurança antes de adicionar qualquer dependência externa ou biblioteca de terceiros.
---

## Critérios de Avaliação

1. **Necessidade Real:** A funcionalidade pode ser implementada internamente de forma simples em poucas linhas?
2. **Reputação e Manutenção:** O repositório tem manutenção ativa, comunidade estabelecida e releases recentes?
3. **Segurança (CVEs):** O pacote possui histórico recente de vulnerabilidades críticas não resolvidas?
4. **Licença:** A licença é compatível com uso comercial/permissivo (MIT, Apache-2.0, BSD, ISC)?
5. **Tamanho e Bundle:** Qual o impacto no bundle frontend ou na cadeia de dependências transitivas?
6. **Lockfile:** Garantir versionamento exato no lockfile do projeto.
