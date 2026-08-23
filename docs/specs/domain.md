# Mercadinho Inteligente — domain.md

## Linguagem Ubíqua

| Termo | Definição |
| :--- | :--- |
| **Produto** | Item comercializado com código de barras, descrição, preço de custo, preço de venda e saldo de estoque. |
| **Estoque Mínimo** | Quantidade limiar que dispara alerta visual de reposição urgente. |
| **Venda (Transação)** | Registro de uma operação de caixa contendo forma de pagamento, descontos, total e operador. |
| **Item de Venda** | Linha da venda associando produto, quantidade, preço unitário e subtotal no momento da venda. |
| **Cupom de Venda** | Documento impresso ou digital contendo o extrato da compra, dados do mercadinho e QR Code. |
| **Forma de Pagamento** | Método financeiro (`DINHEIRO`, `PIX`, `DEBITO`, `CREDITO`). |

## Esquema das Abas do Google Sheets

### 1. Aba `Produtos`
- `id` (UUIDv7 string)
- `codigo_barras` (string único / indexado)
- `nome` (string)
- `categoria` (string)
- `preco_custo` (number float)
- `preco_venda` (number float)
- `estoque_atual` (number integer/float)
- `estoque_minimo` (number integer/float)
- `unidade_medida` (`UN`, `KG`, `L`, `PCT`, `CX`)
- `ativo` (boolean)
- `criado_em` (ISO timestamp)
- `atualizado_em` (ISO timestamp)

### 2. Aba `Vendas`
- `id` (UUIDv7 string)
- `numero_cupom` (sequencial formatado, ex: `#000142`)
- `data_hora` (ISO timestamp)
- `total_bruto` (number)
- `desconto` (number)
- `total_liquido` (number)
- `forma_pagamento` (`DINHEIRO`, `PIX`, `DEBITO`, `CREDITO`)
- `valor_recebido` (number)
- `troco` (number)
- `status` (`CONCLUIDA`, `CANCELADA`)
- `operador` (email/nome do operador logado)

### 3. Aba `ItensVenda`
- `id` (UUIDv7 string)
- `venda_id` (UUIDv7 foreign key para Vendas)
- `produto_id` (UUIDv7 foreign key para Produtos)
- `nome_produto` (snapshot do nome no momento da venda)
- `quantidade` (number)
- `preco_unitario` (snapshot do preço de venda)
- `subtotal` (number)

### 4. Aba `Configuracoes`
- `chave` (string única, ex: `NOME_FANTASIA`, `CNPJ_CPF`, `CHAVE_PIX`, `MENSAGEM_RODAPE`, `LARGURA_CUPOM_MM`)
- `valor` (string)
