/**
 * Mercadinho Inteligente - Database
 * Camada de Acesso a Dados (DAO) para o Google Sheets.
 */

var Database = (function() {
  var SHEET_PRODUTOS = 'Produtos';
  var SHEET_VENDAS = 'Vendas';
  var SHEET_ITENS_VENDA = 'ItensVenda';
  var SHEET_CONFIG = 'Configuracoes';

  /**
   * Obtém a planilha ativa (Spreadsheet).
   */
  function getSpreadsheet() {
    return SpreadsheetApp.getActiveSpreadsheet();
  }

  /**
   * Inicializa todas as abas e cabeçalhos se não existirem, além de inserir dados de exemplo.
   */
  function setupDatabase() {
    var ss = getSpreadsheet();

    // 1. Aba Produtos
    var sheetProdutos = ss.getSheetByName(SHEET_PRODUTOS);
    if (!sheetProdutos) {
      sheetProdutos = ss.insertSheet(SHEET_PRODUTOS);
      sheetProdutos.appendRow([
        'id', 'codigo_barras', 'nome', 'categoria', 'preco_custo', 
        'preco_venda', 'estoque_atual', 'estoque_minimo', 'unidade_medida', 
        'ativo', 'criado_em', 'atualizado_em'
      ]);
      formatHeader(sheetProdutos);

      // Inserir produtos de demonstração
      var demoProdutos = [
        [SecurityUtils.generateUUID(), '7891000100101', 'Arroz Agulhinha Tipo 1 5kg', 'Mercearia', 19.50, 26.90, 24, 5, 'PCT', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000200202', 'Feijão Carioca 1kg', 'Mercearia', 6.20, 8.90, 18, 5, 'PCT', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000300303', 'Óleo de Soja 900ml', 'Mercearia', 4.50, 6.49, 30, 8, 'UN', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000400404', 'Leite Integral UHT 1L', 'Laticínios', 3.80, 5.29, 4, 10, 'UN', true, new Date().toISOString(), new Date().toISOString()], // Estoque baixo!
        [SecurityUtils.generateUUID(), '7891000500505', 'Café Torrado e Moído 500g', 'Mercearia', 12.00, 16.90, 12, 4, 'PCT', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000600606', 'Refrigerante Cola 2L', 'Bebidas', 6.50, 9.99, 20, 6, 'UN', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000700707', 'Sabão em Pó 1kg', 'Limpeza', 8.50, 12.90, 15, 3, 'CX', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000800808', 'Biscoito Recheado Chocolate 130g', 'Snacks', 2.10, 3.49, 2, 5, 'UN', true, new Date().toISOString(), new Date().toISOString()] // Estoque baixo!
      ];
      demoProdutos.forEach(function(row) { sheetProdutos.appendRow(row); });
    }

    // 2. Aba Vendas
    var sheetVendas = ss.getSheetByName(SHEET_VENDAS);
    if (!sheetVendas) {
      sheetVendas = ss.insertSheet(SHEET_VENDAS);
      sheetVendas.appendRow([
        'id', 'numero_cupom', 'data_hora', 'total_bruto', 'desconto', 
        'total_liquido', 'forma_pagamento', 'valor_recebido', 'troco', 
        'status', 'operador'
      ]);
      formatHeader(sheetVendas);
    }

    // 3. Aba ItensVenda
    var sheetItens = ss.getSheetByName(SHEET_ITENS_VENDA);
    if (!sheetItens) {
      sheetItens = ss.insertSheet(SHEET_ITENS_VENDA);
      sheetItens.appendRow([
        'id', 'venda_id', 'produto_id', 'nome_produto', 
        'quantidade', 'preco_unitario', 'subtotal'
      ]);
      formatHeader(sheetItens);
    }

    // 4. Aba Configuracoes
    var sheetConfig = ss.getSheetByName(SHEET_CONFIG);
    if (!sheetConfig) {
      sheetConfig = ss.insertSheet(SHEET_CONFIG);
      sheetConfig.appendRow(['chave', 'valor', 'descricao']);
      formatHeader(sheetConfig);

      var configsIniciais = [
        ['NOME_FANTASIA', 'Mercadinho & Conveniência Express', 'Nome exibido no PDV e cupons'],
        ['CNPJ_CPF', '12.345.678/0001-90', 'Documento para o cupom'],
        ['ENDERECO', 'Rua do Comércio, 123 - Centro', 'Endereço no cupom'],
        ['TELEFONE', '(11) 99876-5432', 'Telefone de contato'],
        ['CHAVE_PIX', 'mercadinho.express@pix.com.br', 'Chave Pix para recebimento'],
        ['MENSAGEM_RODAPE', 'Obrigado pela preferência! Volte sempre!', 'Mensagem final do cupom'],
        ['PROXIMO_NUMERO_CUPOM', '1', 'Contador sequencial do cupom']
      ];
      configsIniciais.forEach(function(c) { sheetConfig.appendRow(c); });
    }

    return { sucesso: true, mensagem: 'Banco de dados configurado com sucesso.' };
  }

  function formatHeader(sheet) {
    var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setBackground('#0f172a');
    headerRange.setFontColor('#f8fafc');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  function getSheet(name) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName(name);
    }
    return sheet;
  }

  function sheetToObjects(sheet) {
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    var headers = data[0];
    var results = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = { _rowIndex: i + 1 };
      for (var j = 0; j < headers.length; j++) {
        var val = row[j];
        if (typeof val === 'string' && val.charAt(0) === "'") {
          val = val.substring(1);
        }
        obj[headers[j]] = val;
      }
      results.push(obj);
    }
    return results;
  }

  return {
    SHEET_PRODUTOS: SHEET_PRODUTOS,
    SHEET_VENDAS: SHEET_VENDAS,
    SHEET_ITENS_VENDA: SHEET_ITENS_VENDA,
    SHEET_CONFIG: SHEET_CONFIG,
    getSpreadsheet: getSpreadsheet,
    getSheet: getSheet,
    setupDatabase: setupDatabase,
    sheetToObjects: sheetToObjects
  };
})();
