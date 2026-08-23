# Mercadinho Inteligente — security.md

## Segurança Específica para Google Apps Script & Google Sheets

### 1. Prevenção contra Formula Injection (CSV / Spreadsheet Injection)
- No Google Sheets, strings iniciadas com `=`, `+`, `-`, `@`, `\t`, `\r` podem ser interpretadas como fórmulas perigosas.
- O `SecurityUtils.gs` deve escapar ou sanitizar qualquer entrada textual antes de salvar nas células das planilhas.

### 2. Autenticação e Identidade
- O usuário já está autenticado no Chrome / Google Workspace.
- Obtenção do e-mail do operador via `Session.getActiveUser().getEmail()` ou `Session.getEffectiveUser().getEmail()`.
- O Web App pode ser publicado no modo restrito à organização/domínio ou acessível a operadores autorizados.

### 3. Sanitização contra XSS
- Todo dado vindo do Sheets renderizado no HTML Service deve ser escapado adequadamente antes de ser inserido no DOM.
- Uso de `textContent` ou templates seguros no frontend.

### 4. Controle de Concorrência e Race Conditions
- Em ambiente com múltiplos caixas simultâneos, o uso de `LockService.getScriptLock().tryLock(10000)` é mandatório no momento da gravação da venda para garantir consistência de saldo de estoque.
