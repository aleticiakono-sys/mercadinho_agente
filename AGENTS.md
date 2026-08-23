# [NOME_DO_PROJETO] — AGENTS.md

## Diretrizes Gerais para Agentes Autônomos

### Idioma de trabalho
- Responder e documentar em português do Brasil.

### Workflow obrigatório (RPI)
1. **RESEARCH:** Obtenha contexto lendo `docs/specs/*` e consultando o grafo de conhecimento (Graphify). Não edite código nesta fase.
2. **PLAN:** Estruture as mudanças propostas, arquivos afetados, estratégia de testes e checklists de segurança.
3. **IMPLEMENT:** Escreva código limpo, desacoplado, com responsabilidade única e testes automatizados.
4. **VERIFY:** Execute testes, linter e build.
5. **REVIEW:** Audite segurança (OWASP), Clean Code e gere o relatório de task em `docs/tasks/`.

### Regras Invioláveis
- Menor privilégio: Agentes de pesquisa têm apenas permissão de leitura.
- Segredos: NUNCA ler ou expor arquivos `.env`, chaves privadas ou senhas.
- Queries: Proibida concatenação de strings em comandos SQL ou shell (usar queries parametrizadas).
- Migrations: Proibido rodar migrações em produção sem runbook e aprovação humana.
- Erros: Respostas de erro padronizadas sem expor stack traces.

### Graphify (Grafo de Conhecimento)
- Consulte o grafo com `graphify query "<pergunta>"` ou `python -m graphify query "<pergunta>"` antes de ler arquivos em massa.
- Após alterar código, execute `python -m graphify extract . --code-only` para atualizar o grafo.
