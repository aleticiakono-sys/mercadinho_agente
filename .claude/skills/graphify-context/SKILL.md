---
name: graphify-context
description: Use para obter contexto preciso do codebase com custo mínimo de tokens. Consulta o grafo de conhecimento antes de ler arquivos individualmente.
---

## Quando usar

- Início de qualquer sessão de trabalho
- Fase RESEARCH antes de implementar
- Análise de impacto de uma mudança
- Onboarding em sessão nova

## Passos

1. Verificar se `graphify-out/graph.json` existe. Se não, rodar `python -m graphify extract . --code-only` ou `/graphify .`
2. `python -m graphify query "[contexto da tarefa]"` — BFS, contexto amplo
3. `python -m graphify path "A" "B"` — rastrear dependência entre dois componentes
4. `python -m graphify explain "Componente"` — entender um nó específico
5. Ler apenas os arquivos indicados pelo grafo

## Após implementação

python -m graphify extract . --update
