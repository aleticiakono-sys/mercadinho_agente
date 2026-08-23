# Mercadinho Inteligente — api-contracts.md

## Contratos de Funções RPC (google.script.run)

A comunicação entre a SPA no navegador e o backend no Apps Script ocorre através de chamadas assíncronas no padrão `google.script.run`.

### 1. `getInitialData()`
- **Entrada:** Nenhuma.
- **Retorno:**
```json
{
  "sucesso": true,
  "produtos": [
    {
      "id": "uuid",
      "codigo_barras": "7891234567890",
      "nome": "Arroz Tipo 1 5kg",
      "categoria": "Alimentos",
      "preco_venda": 28.90,
      "preco_custo": 21.50,
      "estoque_atual": 15,
      "estoque_minimo": 5,
      "unidade_medida": "UN"
    }
  ],
  "configuracoes": {
    "NOME_FANTASIA": "Mercadinho do Bairro",
    "CNPJ_CPF": "12.345.678/0001-90",
    "CHAVE_PIX": "financeiro@mercadinho.com",
    "MENSAGEM_RODAPE": "Obrigado pela preferência! Volte sempre!"
  },
  "usuario": "operador@gmail.com"
}
```

### 2. `salvarProduto(produtoDTO)`
- **Entrada:** Objeto do produto com campos validados.
- **Retorno:** `{ "sucesso": true, "produto": { ... }, "mensagem": "Produto salvo com sucesso" }`

### 3. `registrarVenda(vendaDTO)`
- **Entrada:**
```json
{
  "forma_pagamento": "PIX",
  "valor_recebido": 50.00,
  "desconto": 2.00,
  "itens": [
    {
      "produto_id": "uuid",
      "quantidade": 2,
      "preco_unitario": 24.00
    }
  ]
}
```
- **Retorno:**
```json
{
  "sucesso": true,
  "venda": {
    "id": "uuid",
    "numero_cupom": "#000089",
    "total_liquido": 46.00,
    "troco": 4.00,
    "itens": [ ... ]
  },
  "cupomHtml": "<div>...</div>"
}
```

### 4. `getDashboardData(periodo)`
- **Entrada:** `periodo` (`"hoje"`, `"semana"`, `"mes"`).
- **Retorno:**
```json
{
  "sucesso": true,
  "faturamento": 1450.80,
  "totalVendas": 42,
  "ticketMedio": 34.54,
  "alertasEstoque": 3,
  "vendasPorFormaPagamento": {
    "DINHEIRO": 450.00,
    "PIX": 620.80,
    "DEBITO": 200.00,
    "CREDITO": 180.00
  },
  "produtosMaisVendidos": [
    { "nome": "Refrigerante 2L", "quantidade": 28, "total": 224.00 }
  ]
}
```

### 5. `cancelarVenda(vendaId)`
- **Entrada:** `vendaId` (UUID).
- **Retorno:** `{ "sucesso": true, "mensagem": "Venda cancelada e estoque estornado com sucesso" }`
