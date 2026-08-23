# Mercadinho Inteligente (PDV & Estoque) — main.md

## Visão

Plataforma completa de Ponto de Venda (PDV), controle de estoque em tempo real, emissão de cupom não fiscal/térmico e dashboard analítico para minimercados e pequenos comércios, executada diretamente sobre **Google Apps Script** e **Google Sheets** com interface web moderna (UI+), responsiva e de alta performance.

## Problema

Pequenos comerciantes sofrem com sistemas de PDV lentos, caros, que exigem servidores locais complexos ou planilhas manuais propensas a erros de estoque, perda de vendas e falta de visão analítica do faturamento diário.

## Usuários principais

- **Operador de Caixa / Vendedor:** Realiza vendas rápidas, busca produtos por código de barras ou nome, calcula troco, gera cobranças Pix/Cartão e imprime cupons.
- **Gerente / Proprietário:** Cadastra produtos, monitora níveis de estoque com alertas automáticos, acompanha faturamento em tempo real no dashboard e ajusta preços/margens.

## Métricas de sucesso

- Tempo de conclusão de uma venda: < 5 segundos.
- Atualização atômica de estoque sem inconsistência ou concorrência.
- Dashboard com carga instantânea de KPIs diários/mensais.
- Impressão de cupom formatada para impressoras térmicas (58mm / 80mm) ou PDF.
- 100% serverless, sem custos de infraestrutura adicionais via Google Workspace / Gmail.

## Escopo inicial

1. **PDV (Frente de Caixa):**
   - Leitura de código de barras ou busca preditiva por nome.
   - Carrinho dinâmico com ajuste de quantidade, desconto e cancelamento de item.
   - Múltiplas formas de pagamento (Dinheiro com cálculo de troco, Pix com QR Code dinâmico, Cartão de Crédito e Débito).
2. **Emissão de Cupom Fiscal / Térmico:**
   - Visualização e impressão instantânea em formato bobina térmica (58mm/80mm).
   - Layout com dados do mercadinho, itens, totais, forma de pagamento, impostos estimados e QR Code Pix.
3. **Gestão de Estoque & Produtos:**
   - Cadastro e edição de produtos (código de barras, nome, categoria, preço de custo, preço de venda, estoque atual, estoque mínimo).
   - Alertas visuais para estoque baixo/esgotado.
   - Entrada rápida de mercadorias e ajuste de inventário.
4. **Dashboard & Relatórios Gerenciais:**
   - Métricas em tempo real: Vendas Hoje, Faturamento Hoje, Ticket Médio, Total de Itens Vendidos.
   - Gráficos interativos: Vendas por Período, Produtos Mais Vendidos, Vendas por Forma de Pagamento.
   - Histórico de vendas com possibilidade de cancelamento e estorno de estoque.
5. **Configurações:**
   - Dados da empresa (Nome Fantasia, CNPJ/CPF, Endereço, Telefone, Chave Pix, Mensagem do Cupom).

## Não-escopo inicial

- Integração com SEFAZ direta para emissão de NFC-e com certificado A1/A3 (emissão inicial como Cupom de Venda / Cupom Não Fiscal com layout fiscal padronizado).
- Balança serial conectada diretamente via porta COM (entrada de peso via campo manual).

## Restrições

- Plataforma baseada em Google Apps Script (HTML Service + Google Sheets como banco de dados).
- Interface moderna, fluida (UI+), SPA sem recarregamentos de página.
- Concorrência de estoque tratada via `LockService` do Apps Script.
