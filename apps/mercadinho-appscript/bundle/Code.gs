/**
 * =========================================================================
 * MERCADINHO INTELIGENTE - BUNDLE UNIFICADO (BACKEND)
 * Cole este arquivo completo no arquivo "Code.gs" do Google Apps Script.
 * =========================================================================
 */

/* -------------------------------------------------------------------------
   1. CONTROLADOR WEB APP (doGet)
   ------------------------------------------------------------------------- */
function doGet(e) {
  Database.setupDatabase();
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Mercadinho Inteligente | PDV & Estoque')
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/3081/3081840.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* -------------------------------------------------------------------------
   2. SECURITY UTILS (Sanitização e Validação)
   ------------------------------------------------------------------------- */
var SecurityUtils = (function() {
  function sanitizeForSheet(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    var str = String(value).trim();
    if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
    return str;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parsePositiveNumber(value, defaultValue) {
    defaultValue = defaultValue || 0;
    var num = parseFloat(value);
    if (isNaN(num) || num < 0) return defaultValue;
    return Number(num.toFixed(2));
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function formatMoney(amount) {
    var val = parseFloat(amount) || 0;
    return 'R$ ' + val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  return {
    sanitizeForSheet: sanitizeForSheet,
    escapeHtml: escapeHtml,
    parsePositiveNumber: parsePositiveNumber,
    generateUUID: generateUUID,
    formatMoney: formatMoney
  };
})();

/* -------------------------------------------------------------------------
   3. DATABASE DAO (Google Sheets)
   ------------------------------------------------------------------------- */
var Database = (function() {
  var SHEET_PRODUTOS = 'Produtos';
  var SHEET_VENDAS = 'Vendas';
  var SHEET_ITENS_VENDA = 'ItensVenda';
  var SHEET_CONFIG = 'Configuracoes';

  function getSpreadsheet() {
    return SpreadsheetApp.getActiveSpreadsheet();
  }

  function setupDatabase() {
    var ss = getSpreadsheet();

    // 1. Produtos
    var sheetProdutos = ss.getSheetByName(SHEET_PRODUTOS);
    if (!sheetProdutos) {
      sheetProdutos = ss.insertSheet(SHEET_PRODUTOS);
      sheetProdutos.appendRow([
        'id', 'codigo_barras', 'nome', 'categoria', 'preco_custo', 
        'preco_venda', 'estoque_atual', 'estoque_minimo', 'unidade_medida', 
        'ativo', 'criado_em', 'atualizado_em'
      ]);
      formatHeader(sheetProdutos);

      var demoProdutos = [
        [SecurityUtils.generateUUID(), '7891000100101', 'Arroz Agulhinha Tipo 1 5kg', 'Mercearia', 19.50, 26.90, 24, 5, 'PCT', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000200202', 'Feijão Carioca 1kg', 'Mercearia', 6.20, 8.90, 18, 5, 'PCT', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000300303', 'Óleo de Soja 900ml', 'Mercearia', 4.50, 6.49, 30, 8, 'UN', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000400404', 'Leite Integral UHT 1L', 'Laticínios', 3.80, 5.29, 4, 10, 'UN', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000500505', 'Café Torrado e Moído 500g', 'Mercearia', 12.00, 16.90, 12, 4, 'PCT', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000600606', 'Refrigerante Cola 2L', 'Bebidas', 6.50, 9.99, 20, 6, 'UN', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000700707', 'Sabão em Pó 1kg', 'Limpeza', 8.50, 12.90, 15, 3, 'CX', true, new Date().toISOString(), new Date().toISOString()],
        [SecurityUtils.generateUUID(), '7891000800808', 'Biscoito Recheado Chocolate 130g', 'Snacks', 2.10, 3.49, 2, 5, 'UN', true, new Date().toISOString(), new Date().toISOString()]
      ];
      demoProdutos.forEach(function(row) { sheetProdutos.appendRow(row); });
    }

    // 2. Vendas
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

    // 3. ItensVenda
    var sheetItens = ss.getSheetByName(SHEET_ITENS_VENDA);
    if (!sheetItens) {
      sheetItens = ss.insertSheet(SHEET_ITENS_VENDA);
      sheetItens.appendRow([
        'id', 'venda_id', 'produto_id', 'nome_produto', 
        'quantidade', 'preco_unitario', 'subtotal'
      ]);
      formatHeader(sheetItens);
    }

    // 4. Configuracoes
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
        if (typeof val === 'string' && val.charAt(0) === "'") val = val.substring(1);
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

/* -------------------------------------------------------------------------
   4. CONFIG SERVICE
   ------------------------------------------------------------------------- */
var ConfigService = (function() {
  function getConfiguracoes() {
    var sheet = Database.getSheet(Database.SHEET_CONFIG);
    var rows = Database.sheetToObjects(sheet);
    var map = {};
    rows.forEach(function(r) { if (r.chave) map[r.chave] = r.valor; });
    return map;
  }

  function salvarConfiguracoes(novasConfigs) {
    var sheet = Database.getSheet(Database.SHEET_CONFIG);
    var rows = Database.sheetToObjects(sheet);
    var existingKeys = {};
    rows.forEach(function(r) { existingKeys[r.chave] = r._rowIndex; });

    for (var chave in novasConfigs) {
      if (novasConfigs.hasOwnProperty(chave)) {
        var valorSanitizado = SecurityUtils.sanitizeForSheet(novasConfigs[chave]);
        if (existingKeys[chave]) {
          sheet.getRange(existingKeys[chave], 2).setValue(valorSanitizado);
        } else {
          sheet.appendRow([SecurityUtils.sanitizeForSheet(chave), valorSanitizado, 'Personalizado']);
        }
      }
    }
    return { sucesso: true, mensagem: 'Configurações salvas com sucesso.' };
  }

  function getNextNumeroCupom() {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(5000);
      var sheet = Database.getSheet(Database.SHEET_CONFIG);
      var rows = Database.sheetToObjects(sheet);
      var rowIndex = null;
      var currentNumber = 1;

      for (var i = 0; i < rows.length; i++) {
        if (rows[i].chave === 'PROXIMO_NUMERO_CUPOM') {
          rowIndex = rows[i]._rowIndex;
          currentNumber = parseInt(rows[i].valor, 10) || 1;
          break;
        }
      }

      var formatted = '#' + ('000000' + currentNumber).slice(-6);
      if (rowIndex) {
        sheet.getRange(rowIndex, 2).setValue(currentNumber + 1);
      } else {
        sheet.appendRow(['PROXIMO_NUMERO_CUPOM', (currentNumber + 1).toString(), 'Contador sequencial']);
      }
      return formatted;
    } finally {
      lock.releaseLock();
    }
  }

  return {
    getConfiguracoes: getConfiguracoes,
    salvarConfiguracoes: salvarConfiguracoes,
    getNextNumeroCupom: getNextNumeroCupom
  };
})();

/* -------------------------------------------------------------------------
   5. PRODUTOS SERVICE
   ------------------------------------------------------------------------- */
var ProdutosService = (function() {
  function getProdutos(apenasAtivos) {
    if (apenasAtivos === undefined) apenasAtivos = true;
    var sheet = Database.getSheet(Database.SHEET_PRODUTOS);
    var rows = Database.sheetToObjects(sheet);

    return rows.filter(function(p) {
      return !apenasAtivos || p.ativo === true || p.ativo === 'true' || p.ativo === 1;
    }).map(function(p) {
      var estoqueAtual = parseFloat(p.estoque_atual) || 0;
      var estoqueMin = parseFloat(p.estoque_minimo) || 0;
      var precoVenda = parseFloat(p.preco_venda) || 0;
      var precoCusto = parseFloat(p.preco_custo) || 0;
      var margemLucro = precoCusto > 0 ? (((precoVenda - precoCusto) / precoCusto) * 100).toFixed(1) : 0;

      return {
        id: p.id,
        codigo_barras: String(p.codigo_barras || '').trim(),
        nome: String(p.nome || '').trim(),
        categoria: String(p.categoria || 'Geral').trim(),
        preco_custo: precoCusto,
        preco_venda: precoVenda,
        estoque_atual: estoqueAtual,
        estoque_minimo: estoqueMin,
        unidade_medida: String(p.unidade_medida || 'UN').trim(),
        ativo: p.ativo === true || p.ativo === 'true' || p.ativo === 1,
        margem_lucro: parseFloat(margemLucro),
        alerta_estoque: estoqueAtual <= estoqueMin,
        estoque_zerado: estoqueAtual <= 0
      };
    });
  }

  function salvarProduto(produto) {
    if (!produto || !produto.nome || produto.preco_venda === undefined) {
      throw new Error('Nome e Preço de Venda são obrigatórios.');
    }

    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      var sheet = Database.getSheet(Database.SHEET_PRODUTOS);
      var rows = Database.sheetToObjects(sheet);

      var id = produto.id || SecurityUtils.generateUUID();
      var codigoBarras = String(produto.codigo_barras || '').trim();
      var nome = String(produto.nome).trim();
      var categoria = String(produto.categoria || 'Geral').trim();
      var precoCusto = SecurityUtils.parsePositiveNumber(produto.preco_custo, 0);
      var precoVenda = SecurityUtils.parsePositiveNumber(produto.preco_venda, 0);
      var estoqueAtual = parseFloat(produto.estoque_atual) || 0;
      var estoqueMinimo = parseFloat(produto.estoque_minimo) || 0;
      var unidade = String(produto.unidade_medida || 'UN').toUpperCase();
      var ativo = produto.ativo !== false;
      var agora = new Date().toISOString();

      var existingRowIndex = null;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id === id) {
          existingRowIndex = rows[i]._rowIndex;
          break;
        }
      }

      if (codigoBarras) {
        for (var j = 0; j < rows.length; j++) {
          if (rows[j].codigo_barras === codigoBarras && rows[j].id !== id) {
            throw new Error('Já existe outro produto cadastrado com este código de barras (' + codigoBarras + ').');
          }
        }
      }

      if (existingRowIndex) {
        sheet.getRange(existingRowIndex, 2, 1, 11).setValues([[
          SecurityUtils.sanitizeForSheet(codigoBarras),
          SecurityUtils.sanitizeForSheet(nome),
          SecurityUtils.sanitizeForSheet(categoria),
          precoCusto,
          precoVenda,
          estoqueAtual,
          estoqueMinimo,
          SecurityUtils.sanitizeForSheet(unidade),
          ativo,
          sheet.getRange(existingRowIndex, 11).getValue() || agora,
          agora
        ]]);
      } else {
        sheet.appendRow([
          id,
          SecurityUtils.sanitizeForSheet(codigoBarras),
          SecurityUtils.sanitizeForSheet(nome),
          SecurityUtils.sanitizeForSheet(categoria),
          precoCusto,
          precoVenda,
          estoqueAtual,
          estoqueMinimo,
          SecurityUtils.sanitizeForSheet(unidade),
          ativo,
          agora,
          agora
        ]);
      }

      return {
        sucesso: true,
        mensagem: existingRowIndex ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.'
      };
    } finally {
      lock.releaseLock();
    }
  }

  function ajustarEstoque(produtoId, quantidadeAjuste, motivo) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      var sheet = Database.getSheet(Database.SHEET_PRODUTOS);
      var rows = Database.sheetToObjects(sheet);

      var targetRow = null;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id === produtoId) {
          targetRow = rows[i];
          break;
        }
      }
      if (!targetRow) throw new Error('Produto não encontrado.');

      var novoEstoque = (parseFloat(targetRow.estoque_atual) || 0) + parseFloat(quantidadeAjuste);
      if (novoEstoque < 0) novoEstoque = 0;

      sheet.getRange(targetRow._rowIndex, 7).setValue(novoEstoque);
      sheet.getRange(targetRow._rowIndex, 12).setValue(new Date().toISOString());

      return { sucesso: true, novoEstoque: novoEstoque, mensagem: 'Estoque atualizado.' };
    } finally {
      lock.releaseLock();
    }
  }

  return {
    getProdutos: getProdutos,
    salvarProduto: salvarProduto,
    ajustarEstoque: ajustarEstoque
  };
})();

/* -------------------------------------------------------------------------
   6. CUPOM FISCAL SERVICE (Térmico)
   ------------------------------------------------------------------------- */
var CupomFiscalService = (function() {
  function gerarHtmlCupom(venda, itens, config) {
    config = config || ConfigService.getConfiguracoes();
    var nomeLoja = SecurityUtils.escapeHtml(config.NOME_FANTASIA || 'MERCADINHO EXPRESS');
    var docLoja = SecurityUtils.escapeHtml(config.CNPJ_CPF || '');
    var enderecoLoja = SecurityUtils.escapeHtml(config.ENDERECO || '');
    var telLoja = SecurityUtils.escapeHtml(config.TELEFONE || '');
    var chavePix = config.CHAVE_PIX || '';
    var msgRodape = SecurityUtils.escapeHtml(config.MENSAGEM_RODAPE || 'Obrigado pela preferência!');

    var dataVenda = new Date(venda.data_hora);
    var dataFormatada = Utilities.formatDate(dataVenda, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');

    var totalBruto = SecurityUtils.formatMoney(venda.total_bruto);
    var desconto = SecurityUtils.formatMoney(venda.desconto);
    var totalLiquido = SecurityUtils.formatMoney(venda.total_liquido);
    var valorRecebido = SecurityUtils.formatMoney(venda.valor_recebido || venda.total_liquido);
    var troco = SecurityUtils.formatMoney(venda.troco || 0);

    var rowsHtml = '';
    for (var i = 0; i < itens.length; i++) {
      var item = itens[i];
      rowsHtml += '<tr>' +
        '<td style="text-align:left; padding: 2px 0;">' + (i + 1) + '. ' + SecurityUtils.escapeHtml(item.nome_produto) + '<br>' +
        '<span style="font-size: 10px; color: #555;">' + item.quantidade + ' x ' + SecurityUtils.formatMoney(item.preco_unitario) + '</span></td>' +
        '<td style="text-align:right; vertical-align: top; padding: 2px 0;">' + SecurityUtils.formatMoney(item.subtotal) + '</td>' +
        '</tr>';
    }

    var pixQrHtml = '';
    if (venda.forma_pagamento === 'PIX' && chavePix) {
      var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=' + encodeURIComponent('PIX: ' + chavePix + ' | Valor: ' + totalLiquido + ' | Ref: ' + venda.numero_cupom);
      pixQrHtml = '<div style="text-align:center; margin-top: 10px; padding-top: 5px; border-top: 1px dashed #000;">' +
        '<div style="font-weight:bold; font-size: 11px;">PAGAMENTO VIA PIX</div>' +
        '<img src="' + qrUrl + '" style="width: 100px; height: 100px; margin: 4px auto; display: block;" />' +
        '<div style="font-size: 10px;">Chave: ' + SecurityUtils.escapeHtml(chavePix) + '</div>' +
        '</div>';
    }

    return '<div class="cupom-thermal-wrapper" style="font-family: \'Courier New\', Courier, monospace; font-size: 12px; line-height: 1.2; width: 100%; max-width: 300px; margin: 0 auto; color: #000; padding: 10px; background: #fff;">' +
      '<div style="text-align:center; font-weight:bold; font-size: 14px;">' + nomeLoja + '</div>' +
      (docLoja ? '<div style="text-align:center; font-size: 11px;">CNPJ/CPF: ' + docLoja + '</div>' : '') +
      (enderecoLoja ? '<div style="text-align:center; font-size: 10px;">' + enderecoLoja + '</div>' : '') +
      (telLoja ? '<div style="text-align:center; font-size: 10px;">Tel: ' + telLoja + '</div>' : '') +
      '<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>' +
      '<div style="text-align:center; font-weight:bold; font-size: 11px;">EXTRATO NÃO FISCAL DE VENDA</div>' +
      '<div style="display:flex; justify-content:space-between; font-size: 11px;">' +
        '<span>CUPOM: <b>' + venda.numero_cupom + '</b></span>' +
        '<span>' + dataFormatada + '</span>' +
      '</div>' +
      '<div style="font-size: 10px; color: #444;">Operador: ' + SecurityUtils.escapeHtml(venda.operador || 'Caixa') + '</div>' +
      '<div style="border-top: 1px dashed #000; margin: 6px 0;"></div>' +
      '<table style="width:100%; font-size: 11px; border-collapse: collapse;">' +
        '<thead><tr style="border-bottom: 1px solid #000;"><th style="text-align:left;">ITEM</th><th style="text-align:right;">TOTAL</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
      '<div style="border-top: 1px dashed #000; margin: 6px 0;"></div>' +
      '<table style="width:100%; font-size: 11px;">' +
        '<tr><td>SUBTOTAL:</td><td style="text-align:right;">' + totalBruto + '</td></tr>' +
        (venda.desconto > 0 ? '<tr><td>DESCONTO:</td><td style="text-align:right; color: #b91c1c;">- ' + desconto + '</td></tr>' : '') +
        '<tr style="font-size: 13px; font-weight: bold;"><td>TOTAL A PAGAR:</td><td style="text-align:right;">' + totalLiquido + '</td></tr>' +
        '<tr><td>FORMA PAGTO:</td><td style="text-align:right; font-weight:bold;">' + venda.forma_pagamento + '</td></tr>' +
        (venda.forma_pagamento === 'DINHEIRO' ? '<tr><td>VALOR RECEBIDO:</td><td style="text-align:right;">' + valorRecebido + '</td></tr>' : '') +
        (venda.forma_pagamento === 'DINHEIRO' && venda.troco > 0 ? '<tr style="font-weight:bold;"><td>TROCO:</td><td style="text-align:right;">' + troco + '</td></tr>' : '') +
      '</table>' +
      pixQrHtml +
      '<div style="border-top: 1px dashed #000; margin: 8px 0 6px 0;"></div>' +
      '<div style="text-align:center; font-size: 10px; font-style: italic;">' + msgRodape + '</div>' +
    '</div>';
  }

  return { gerarHtmlCupom: gerarHtmlCupom };
})();

/* -------------------------------------------------------------------------
   7. VENDAS SERVICE (Checkout Atômico)
   ------------------------------------------------------------------------- */
var VendasService = (function() {
  function registrarVenda(vendaDTO) {
    if (!vendaDTO || !vendaDTO.itens || vendaDTO.itens.length === 0) {
      throw new Error('O carrinho está vazio.');
    }

    var lock = LockService.getScriptLock();
    try {
      var hasLock = lock.tryLock(12000);
      if (!hasLock) throw new Error('Sistema ocupado. Tente novamente em segundos.');

      var sheetProdutos = Database.getSheet(Database.SHEET_PRODUTOS);
      var sheetVendas = Database.getSheet(Database.SHEET_VENDAS);
      var sheetItens = Database.getSheet(Database.SHEET_ITENS_VENDA);

      var produtosRows = Database.sheetToObjects(sheetProdutos);
      var produtosMap = {};
      produtosRows.forEach(function(p) { produtosMap[p.id] = p; });

      var totalBruto = 0;
      var itensProcessados = [];

      for (var i = 0; i < vendaDTO.itens.length; i++) {
        var itemReq = vendaDTO.itens[i];
        var produto = produtosMap[itemReq.produto_id];
        if (!produto) throw new Error('Produto ID ' + itemReq.produto_id + ' não encontrado.');

        var qtd = parseFloat(itemReq.quantidade) || 1;
        var precoUnitario = parseFloat(itemReq.preco_unitario) || parseFloat(produto.preco_venda);
        var subtotal = Number((qtd * precoUnitario).toFixed(2));
        var estoqueAtual = parseFloat(produto.estoque_atual) || 0;

        if (estoqueAtual < qtd) {
          throw new Error('Estoque insuficiente para "' + produto.nome + '". Disponível: ' + estoqueAtual);
        }

        totalBruto += subtotal;
        itensProcessados.push({
          produto_id: produto.id,
          nome_produto: produto.nome,
          quantidade: qtd,
          preco_unitario: precoUnitario,
          subtotal: subtotal,
          _produtoRowIndex: produto._rowIndex,
          _novoEstoque: estoqueAtual - qtd
        });
      }

      var desconto = SecurityUtils.parsePositiveNumber(vendaDTO.desconto, 0);
      var totalLiquido = Math.max(0, Number((totalBruto - desconto).toFixed(2)));
      var valorRecebido = SecurityUtils.parsePositiveNumber(vendaDTO.valor_recebido, totalLiquido);
      var troco = Math.max(0, Number((valorRecebido - totalLiquido).toFixed(2)));
      var formaPagamento = String(vendaDTO.forma_pagamento || 'DINHEIRO').toUpperCase();
      var operador = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'Caixa Principal';

      var vendaId = SecurityUtils.generateUUID();
      var numeroCupom = ConfigService.getNextNumeroCupom();
      var agora = new Date().toISOString();

      sheetVendas.appendRow([
        vendaId, numeroCupom, agora, totalBruto, desconto,
        totalLiquido, formaPagamento, valorRecebido, troco, 'CONCLUIDA',
        SecurityUtils.sanitizeForSheet(operador)
      ]);

      for (var j = 0; j < itensProcessados.length; j++) {
        var it = itensProcessados[j];
        sheetItens.appendRow([
          SecurityUtils.generateUUID(), vendaId, it.produto_id,
          SecurityUtils.sanitizeForSheet(it.nome_produto),
          it.quantidade, it.preco_unitario, it.subtotal
        ]);
        sheetProdutos.getRange(it._produtoRowIndex, 7).setValue(it._novoEstoque);
        sheetProdutos.getRange(it._produtoRowIndex, 12).setValue(agora);
      }

      var vendaObjeto = {
        id: vendaId, numero_cupom: numeroCupom, data_hora: agora,
        total_bruto: totalBruto, desconto: desconto, total_liquido: totalLiquido,
        forma_pagamento: formaPagamento, valor_recebido: valorRecebido, troco: troco,
        status: 'CONCLUIDA', operador: operador
      };

      var cupomHtml = CupomFiscalService.gerarHtmlCupom(vendaObjeto, itensProcessados);

      return {
        sucesso: true,
        mensagem: 'Venda ' + numeroCupom + ' finalizada com sucesso!',
        venda: vendaObjeto,
        itens: itensProcessados,
        cupomHtml: cupomHtml
      };
    } finally {
      lock.releaseLock();
    }
  }

  function getHistoricoVendas(dataFiltro) {
    var sheetVendas = Database.getSheet(Database.SHEET_VENDAS);
    var sheetItens = Database.getSheet(Database.SHEET_ITENS_VENDA);
    var vendas = Database.sheetToObjects(sheetVendas);
    var itens = Database.sheetToObjects(sheetItens);

    var itensByVenda = {};
    itens.forEach(function(it) {
      if (!itensByVenda[it.venda_id]) itensByVenda[it.venda_id] = [];
      itensByVenda[it.venda_id].push(it);
    });

    if (dataFiltro) {
      var diaStr = dataFiltro.substring(0, 10);
      vendas = vendas.filter(function(v) {
        return v.data_hora && String(v.data_hora).substring(0, 10) === diaStr;
      });
    }

    vendas.sort(function(a, b) { return new Date(b.data_hora) - new Date(a.data_hora); });

    return vendas.map(function(v) {
      return {
        id: v.id, numero_cupom: v.numero_cupom, data_hora: v.data_hora,
        total_bruto: parseFloat(v.total_bruto) || 0,
        desconto: parseFloat(v.desconto) || 0,
        total_liquido: parseFloat(v.total_liquido) || 0,
        forma_pagamento: v.forma_pagamento,
        valor_recebido: parseFloat(v.valor_recebido) || 0,
        troco: parseFloat(v.troco) || 0,
        status: v.status, operador: v.operador,
        itens: itensByVenda[v.id] || []
      };
    });
  }

  function cancelarVenda(vendaId) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      var sheetVendas = Database.getSheet(Database.SHEET_VENDAS);
      var sheetItens = Database.getSheet(Database.SHEET_ITENS_VENDA);
      var sheetProdutos = Database.getSheet(Database.SHEET_PRODUTOS);

      var vendas = Database.sheetToObjects(sheetVendas);
      var itens = Database.sheetToObjects(sheetItens);
      var produtos = Database.sheetToObjects(sheetProdutos);

      var targetVenda = null;
      for (var i = 0; i < vendas.length; i++) {
        if (vendas[i].id === vendaId) { targetVenda = vendas[i]; break; }
      }
      if (!targetVenda) throw new Error('Venda não encontrada.');
      if (targetVenda.status === 'CANCELADA') throw new Error('Venda já cancelada.');

      sheetVendas.getRange(targetVenda._rowIndex, 10).setValue('CANCELADA');

      var produtosMap = {};
      produtos.forEach(function(p) { produtosMap[p.id] = p; });

      var itensDesta = itens.filter(function(it) { return it.venda_id === vendaId; });
      for (var j = 0; j < itensDesta.length; j++) {
        var it = itensDesta[j];
        var prod = produtosMap[it.produto_id];
        if (prod) {
          var estoqueRestaurado = (parseFloat(prod.estoque_atual) || 0) + (parseFloat(it.quantidade) || 0);
          sheetProdutos.getRange(prod._rowIndex, 7).setValue(estoqueRestaurado);
        }
      }

      return { sucesso: true, mensagem: 'Venda cancelada e estoque estornado.' };
    } finally {
      lock.releaseLock();
    }
  }

  return {
    registrarVenda: registrarVenda,
    getHistoricoVendas: getHistoricoVendas,
    cancelarVenda: cancelarVenda
  };
})();

/* -------------------------------------------------------------------------
   8. DASHBOARD SERVICE
   ------------------------------------------------------------------------- */
var DashboardService = (function() {
  function getDashboardMetrics() {
    var sheetVendas = Database.getSheet(Database.SHEET_VENDAS);
    var sheetItens = Database.getSheet(Database.SHEET_ITENS_VENDA);
    var sheetProdutos = Database.getSheet(Database.SHEET_PRODUTOS);

    var vendas = Database.sheetToObjects(sheetVendas);
    var itens = Database.sheetToObjects(sheetItens);
    var produtos = Database.sheetToObjects(sheetProdutos);

    var hojeStr = new Date().toISOString().substring(0, 10);
    var faturamentoHoje = 0;
    var vendasHojeQtd = 0;
    var faturamentoTotal = 0;
    var vendasConcluidas = 0;
    var formasPagamentoHoje = { DINHEIRO: 0, PIX: 0, DEBITO: 0, CREDITO: 0 };
    var vendasPorHora = {};
    for (var h = 6; h <= 23; h++) vendasPorHora[(h < 10 ? '0' : '') + h + ':00'] = 0;
    var vendasValidasIds = {};

    vendas.forEach(function(v) {
      if (v.status !== 'CANCELADA') {
        var valorLiq = parseFloat(v.total_liquido) || 0;
        faturamentoTotal += valorLiq;
        vendasConcluidas++;
        vendasValidasIds[v.id] = true;

        var dataVenda = String(v.data_hora || '');
        if (dataVenda.substring(0, 10) === hojeStr) {
          faturamentoHoje += valorLiq;
          vendasHojeQtd++;
          var forma = String(v.forma_pagamento || 'DINHEIRO').toUpperCase();
          if (formasPagamentoHoje[forma] !== undefined) formasPagamentoHoje[forma] += valorLiq;
          else formasPagamentoHoje[forma] = valorLiq;

          if (dataVenda.length >= 16) {
            var hora = dataVenda.substring(11, 13) + ':00';
            if (vendasPorHora[hora] !== undefined) vendasPorHora[hora] += valorLiq;
          }
        }
      }
    });

    var ticketMedioHoje = vendasHojeQtd > 0 ? (faturamentoHoje / vendasHojeQtd) : 0;
    var alertasEstoque = 0;
    var produtosEstoqueZerado = 0;
    produtos.forEach(function(p) {
      var estAtual = parseFloat(p.estoque_atual) || 0;
      var estMin = parseFloat(p.estoque_minimo) || 0;
      if (estAtual <= estMin) alertasEstoque++;
      if (estAtual <= 0) produtosEstoqueZerado++;
    });

    var produtosVendidosMap = {};
    itens.forEach(function(it) {
      if (vendasValidasIds[it.venda_id]) {
        var pId = it.produto_id;
        var pNome = it.nome_produto || 'Produto';
        var qtd = parseFloat(it.quantidade) || 0;
        var subtotal = parseFloat(it.subtotal) || 0;
        if (!produtosVendidosMap[pId]) produtosVendidosMap[pId] = { nome: pNome, quantidade: 0, total: 0 };
        produtosVendidosMap[pId].quantidade += qtd;
        produtosVendidosMap[pId].total += subtotal;
      }
    });

    var rankingProdutos = [];
    for (var key in produtosVendidosMap) rankingProdutos.push(produtosVendidosMap[key]);
    rankingProdutos.sort(function(a, b) { return b.quantidade - a.quantidade; });

    return {
      faturamentoHoje: Number(faturamentoHoje.toFixed(2)),
      vendasHojeQtd: vendasHojeQtd,
      ticketMedioHoje: Number(ticketMedioHoje.toFixed(2)),
      faturamentoTotal: Number(faturamentoTotal.toFixed(2)),
      vendasTotalQtd: vendasConcluidas,
      alertasEstoque: alertasEstoque,
      produtosEstoqueZerado: produtosEstoqueZerado,
      totalProdutosCadastrados: produtos.length,
      formasPagamentoHoje: formasPagamentoHoje,
      vendasPorHora: vendasPorHora,
      topProdutos: rankingProdutos.slice(0, 5)
    };
  }

  return { getDashboardMetrics: getDashboardMetrics };
})();

/* -------------------------------------------------------------------------
   9. DISPATCHER RPC (google.script.run)
   ------------------------------------------------------------------------- */
function apiGetInitialData() {
  try {
    Database.setupDatabase();
    return {
      sucesso: true,
      produtos: ProdutosService.getProdutos(false),
      configuracoes: ConfigService.getConfiguracoes(),
      dashboard: DashboardService.getDashboardMetrics(),
      usuario: Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'operador@gmail.com'
    };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}

function apiSalvarProduto(dto) {
  try {
    var res = ProdutosService.salvarProduto(dto);
    return { sucesso: true, mensagem: res.mensagem, produtos: ProdutosService.getProdutos(false) };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}

function apiAjustarEstoque(id, delta, motivo) {
  try {
    var res = ProdutosService.ajustarEstoque(id, delta, motivo);
    return { sucesso: true, mensagem: res.mensagem, produtos: ProdutosService.getProdutos(false) };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}

function apiRegistrarVenda(dto) {
  try {
    var res = VendasService.registrarVenda(dto);
    return {
      sucesso: true,
      venda: res.venda,
      itens: res.itens,
      cupomHtml: res.cupomHtml,
      mensagem: res.mensagem,
      produtos: ProdutosService.getProdutos(false),
      dashboard: DashboardService.getDashboardMetrics()
    };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}

function apiGetHistoricoVendas(dataFiltro) {
  try {
    return { sucesso: true, vendas: VendasService.getHistoricoVendas(dataFiltro) };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}

function apiCancelarVenda(id) {
  try {
    var res = VendasService.cancelarVenda(id);
    return {
      sucesso: true,
      mensagem: res.mensagem,
      produtos: ProdutosService.getProdutos(false),
      dashboard: DashboardService.getDashboardMetrics()
    };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}

function apiSalvarConfiguracoes(dto) {
  try {
    var res = ConfigService.salvarConfiguracoes(dto);
    return { sucesso: true, mensagem: res.mensagem, configuracoes: ConfigService.getConfiguracoes() };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}

function apiReimprimirCupom(vendaId) {
  try {
    var vendas = VendasService.getHistoricoVendas(null);
    var venda = vendas.find(function(v) { return v.id === vendaId; });
    if (!venda) throw new Error('Venda não encontrada.');
    return {
      sucesso: true,
      cupomHtml: CupomFiscalService.gerarHtmlCupom(venda, venda.itens)
    };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}
