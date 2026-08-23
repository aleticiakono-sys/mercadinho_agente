---
name: component-reuse-audit
description: Auditoria de reuso de componentes, hooks e utilitários antes da criação de novos elementos na UI ou no backend.
---

## Passos

1. Consultar componentes existentes em `packages/ui` ou `src/components/ui`.
2. Verificar hooks compartilhados para requisições, formulários, debounce ou modais.
3. Se o padrão existir em 2+ locais, extrair para pacote compartilhado.
4. Se o caso de uso for específico e isolado, evitar abstração prematura (YAGNI).
5. Garantir que componentes reutilizáveis recebam dados via props e não dependam de estados globais ocultos.
