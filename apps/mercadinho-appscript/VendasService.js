/**
 * Mercadinho Inteligente - VendasService
 * Gerenciamento de checkout, transações atômicas, decremento de estoque e estornos.
 */

var VendasService = (function() {
  /**
   * Processa e finaliza uma venda no PDV.
   */
  function registrarVenda(vendaDTO) {
    if (!vendaDTO || !vendaDTO.itens || vendaDTO.itens.length === 0) {
      throw new Error('O carrinho de compras está vazio.');
    }

    var lock = LockService.getScriptLock();
    try {
      // 1. Tentar adquirir lock para concorrência
      var hasLock = lock.tryLock(12000);
      if (!hasLock) {
        throw new Error('O sistema está processando outra venda no momento. Tente novamente em alguns segundos.');
      }

      var sheetProdutos = Database.getSheet(Database.SHEET_PRODUTOS);
      var sheetVendas = Database.getSheet(Database.SHEET_VENDAS);
      var sheetItens = Database.getSheet(Database.SHEET_ITENS_VENDA);

      var produtosRows = Database.sheetToObjects(sheetProdutos);
      var produtosMap = {};
      produtosRows.forEach(function(p) {
        produtosMap[p.id] = p;
      });

      var totalBruto = 0;
      var itensProcessados = [];

      // 2. Validar disponibilidade de estoque para todos os itens
      for (var i = 0; i < vendaDTO.itens.length; i++) {
        var itemReq = vendaDTO.itens[i];
        var produto = produtosMap[itemReq.produto_id];

        if (!produto) {
          throw new Error('Produto ID ' + itemReq.produto_id + ' não foi encontrado.');
        }

        var qtd = parseFloat(itemReq.quantidade) || 1;
        var precoUnitario = parseFloat(itemReq.preco_unitario) || parseFloat(produto.preco_venda);
        var subtotal = Number((qtd * precoUnitario).toFixed(2));
        var estoqueAtual = parseFloat(produto.estoque_atual) || 0;

        if (estoqueAtual < qtd) {
          throw new Error('Estoque insuficiente para "' + produto.nome + '". Disponível: ' + estoqueAtual + ', Solicitado: ' + qtd);
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

      // 3. Registrar na aba Vendas
      sheetVendas.appendRow([
        vendaId,
        numeroCupom,
        agora,
        totalBruto,
        desconto,
        totalLiquido,
        formaPagamento,
        valorRecebido,
        troco,
        'CONCLUIDA',
        SecurityUtils.sanitizeForSheet(operador)
      ]);

      // 4. Registrar itens na aba ItensVenda e atualizar saldo na aba Produtos
      for (var j = 0; j < itensProcessados.length; j++) {
        var it = itensProcessados[j];
        var itemId = SecurityUtils.generateUUID();
        
        sheetItens.appendRow([
          itemId,
          vendaId,
          it.produto_id,
          SecurityUtils.sanitizeForSheet(it.nome_produto),
          it.quantidade,
          it.preco_unitario,
          it.subtotal
        ]);

        // Atualizar estoque na aba Produtos
        sheetProdutos.getRange(it._produtoRowIndex, 7).setValue(it._novoEstoque);
        sheetProdutos.getRange(it._produtoRowIndex, 12).setValue(agora);
      }

      var vendaObjeto = {
        id: vendaId,
        numero_cupom: numeroCupom,
        data_hora: agora,
        total_bruto: totalBruto,
        desconto: desconto,
        total_liquido: totalLiquido,
        forma_pagamento: formaPagamento,
        valor_recebido: valorRecebido,
        troco: troco,
        status: 'CONCLUIDA',
        operador: operador
      };

      // 5. Gerar Cupom Térmico
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

  /**
   * Obtém histórico de vendas com filtro opcional por data.
   */
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

    // Ordenar por data decrescente
    vendas.sort(function(a, b) {
      return new Date(b.data_hora) - new Date(a.data_hora);
    });

    return vendas.map(function(v) {
      return {
        id: v.id,
        numero_cupom: v.numero_cupom,
        data_hora: v.data_hora,
        total_bruto: parseFloat(v.total_bruto) || 0,
        desconto: parseFloat(v.desconto) || 0,
        total_liquido: parseFloat(v.total_liquido) || 0,
        forma_pagamento: v.forma_pagamento,
        valor_recebido: parseFloat(v.valor_recebido) || 0,
        troco: parseFloat(v.troco) || 0,
        status: v.status,
        operador: v.operador,
        itens: itensByVenda[v.id] || []
      };
    });
  }

  /**
   * Cancela uma venda e estorna o estoque automaticamente.
   */
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
        if (vendas[i].id === vendaId) {
          targetVenda = vendas[i];
          break;
        }
      }

      if (!targetVenda) throw new Error('Venda não encontrada.');
      if (targetVenda.status === 'CANCELADA') throw new Error('Esta venda já foi cancelada anteriormente.');

      // Marcar venda como cancelada
      sheetVendas.getRange(targetVenda._rowIndex, 10).setValue('CANCELADA');

      // Estornar itens ao estoque
      var produtosMap = {};
      produtos.forEach(function(p) { produtosMap[p.id] = p; });

      var itensDestaVenda = itens.filter(function(it) { return it.venda_id === vendaId; });
      for (var j = 0; j < itensDestaVenda.length; j++) {
        var it = itensDestaVenda[j];
        var prod = produtosMap[it.produto_id];
        if (prod) {
          var estoqueRestaurado = (parseFloat(prod.estoque_atual) || 0) + (parseFloat(it.quantidade) || 0);
          sheetProdutos.getRange(prod._rowIndex, 7).setValue(estoqueRestaurado);
        }
      }

      return {
        sucesso: true,
        mensagem: 'Venda ' + targetVenda.numero_cupom + ' cancelada e itens devolvidos ao estoque.'
      };
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
