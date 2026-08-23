# Rule: Reaproveitamento de código e componentes

## Quando reaproveitar

- Reaproveite quando houver duplicação real em pelo menos dois ou três pontos.
- Reaproveite quando a regra for central para o domínio.
- Reaproveite quando o componente representar padrão visual recorrente.

## Quando não reaproveitar

- Não crie componente genérico antes de entender variações reais.
- Não transforme regra simples em framework interno.
- Não force abstração que dificulta leitura.

## Backend

- Reaproveitar validações comuns.
- Reaproveitar middlewares, filters, interceptors e error handlers.
- Reaproveitar clients de integrações externas.
- Reaproveitar políticas de autorização.
- Separar helpers puros de services com dependência.

## Frontend

- Reaproveitar componentes de UI no `packages/ui` ou `src/components/ui`.
- Reaproveitar hooks quando encapsulam comportamento real.
- Reaproveitar schemas de formulário.
- Reaproveitar formatadores, máscaras e validadores.
- Componentes reutilizáveis devem receber props claras, não depender de estado global oculto.

## Monorepo

- Colocar contratos compartilhados em `packages/shared`.
- Colocar componentes visuais genéricos em `packages/ui`.
- Colocar configuração de lint/build/test em `packages/config-*`.
- Evitar dependência circular entre pacotes.
