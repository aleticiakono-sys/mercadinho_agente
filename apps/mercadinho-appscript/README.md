# 🏪 Mercadinho Inteligente — Guia de Instalação e Deploy (Google Apps Script)

Sistema completo de Ponto de Venda (PDV), Gestão de Estoque, Emissão de Cupom Térmico (58mm/80mm) e Dashboard Analítico construído 100% em **Google Apps Script** e **Google Sheets** com interface web moderna (**UI+**).

---

## 📋 Pré-requisitos
- Uma conta Google (Gmail ou Google Workspace) conectada no Google Chrome.
- Acesso ao [Google Drive](https://drive.google.com).

---

## 🚀 Como Instalar e Publicar em 2 Minutos

### Passo 1: Criar a Planilha no Google Drive
1. Acesse seu [Google Sheets](https://sheets.new) e crie uma nova planilha em branco.
2. Dê o nome da planilha de **`Mercadinho - Banco de Dados`**.
3. No menu superior da planilha, clique em **Extensões** > **Apps Script**.

---

### Passo 2: Adicionar os Arquivos no Editor do Apps Script

No editor do Google Apps Script (à esquerda), você precisará criar os arquivos com os mesmos nomes listados abaixo e colar o conteúdo correspondente:

#### 📜 Scripts (.gs) — Criar como *Arquivo de Script*:
1. **`Code.gs`** ← Cole o conteúdo de `Code.js`
2. **`Database.gs`** ← Cole o conteúdo de `Database.js`
3. **`ProdutosService.gs`** ← Cole o conteúdo de `ProdutosService.js`
4. **`VendasService.gs`** ← Cole o conteúdo de `VendasService.js`
5. **`DashboardService.gs`** ← Cole o conteúdo de `DashboardService.js`
6. **`CupomFiscalService.gs`** ← Cole o conteúdo de `CupomFiscalService.js`
7. **`ConfigService.gs`** ← Cole o conteúdo de `ConfigService.js`
8. **`SecurityUtils.gs`** ← Cole o conteúdo de `SecurityUtils.js`

#### 🌐 Arquivos HTML — Criar como *Arquivo HTML*:
1. **`Index.html`** ← Cole o conteúdo de `Index.html`
2. **`Styles.html`** ← Cole o conteúdo de `Styles.html`
3. **`Scripts.html`** ← Cole o conteúdo de `Scripts.html`

---

### Passo 3: Executar a Configuração Inicial (1 Clique)
1. No menu superior do Apps Script, selecione a função **`setupDatabase`** e clique em **Executar** (ícone de Play ▶️).
2. Na primeira execução, o Google solicitará permissão para acessar a planilha. Clique em **Revisar Permissões**, selecione sua conta e clique em **Permitir**.
3. Automaticamente, todas as abas (`Produtos`, `Vendas`, `ItensVenda`, `Configuracoes`) serão criadas e formatadas na sua planilha, já com produtos de exemplo cadastrados.

---

### Passo 4: Publicar como Web App (Aplicativo Web)
1. No canto superior direito do Apps Script, clique no botão azul **Implantar** (*Deploy*) > **Nova implantação** (*New deployment*).
2. Clique no ícone de engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha **App da Web** (*Web app*).
3. Configure os campos:
   - **Descrição:** `Versão 1.0 - PDV e Estoque Mercadinho`
   - **Executar como:** `Usuário acessando o aplicativo da Web` (ou `Eu`)
   - **Quem tem acesso:** `Qualquer pessoa com uma Conta do Google` (ou `Qualquer pessoa`)
4. Clique em **Implantar** (*Deploy*).
5. Copie a **URL do app da Web** gerada e abra no seu navegador Chrome!

---

## ⌨️ Atalhos do Teclado no Caixa
- **`F2`**: Foca imediatamente no campo de busca/código de barras.
- **`F4`**: Abre a tela de finalização de venda e pagamento.
- **`F8`**: Limpa o carrinho atual.
- **`ESC`**: Fecha qualquer modal ou janela sobreposta.

---

## 🖨️ Impressão de Cupom Térmico
- O sistema possui formatação inteligente CSS `@media print` compatível com qualquer impressora térmica USB/Bluetooth (58mm ou 80mm) e impressoras padrão (PDF).
