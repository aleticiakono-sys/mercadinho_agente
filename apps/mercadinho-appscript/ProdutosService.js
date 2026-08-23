/**
 * Mercadinho Inteligente - ProdutosService
 * Regras de negócio de estoque, catálogo e gestão de produtos.
 */

var ProdutosService = (function() {
  /**
   * Retorna todos os produtos ativos com status de estoque calculado.
   */
  function getProdutos(apenasAtivos) {
    if (apenasAtivos === undefined) apenasAtivos = true;
    var sheet = Database.getSheet(Database.SHEET_PRODUTOS);
    var rows = Database.sheetToObjects(sheet);

    var produtos = rows.filter(function(p) {
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

    return produtos;
  }

  /**
   * Cadastra ou atualiza um produto.
   */
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

      // Checar se já existe pelo ID
      var existingRowIndex = null;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id === id) {
          existingRowIndex = rows[i]._rowIndex;
          break;
        }
      }

      // Validar código de barras duplicado para outro ID
      if (codigoBarras) {
        for (var j = 0; j < rows.length; j++) {
          if (rows[j].codigo_barras === codigoBarras && rows[j].id !== id) {
            throw new Error('Já existe outro produto cadastrado com este código de barras (' + codigoBarras + ').');
          }
        }
      }

      if (existingRowIndex) {
        // Atualização
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
        // Novo Produto
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
        mensagem: existingRowIndex ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.',
        produtoId: id
      };
    } finally {
      lock.releaseLock();
    }
  }

  /**
   * Ajusta o estoque rapidamente (Entrada, Saída ou Inventário).
   */
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

      return {
        sucesso: true,
        novoEstoque: novoEstoque,
        mensagem: 'Estoque ajustado para ' + novoEstoque + ' unidades.'
      };
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
