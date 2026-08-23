/**
 * Mercadinho Inteligente - DashboardService
 * Agregação de métricas analíticas, faturamento, ticket médio e gráficos.
 */

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

    var formasPagamentoHoje = {
      DINHEIRO: 0,
      PIX: 0,
      DEBITO: 0,
      CREDITO: 0
    };

    var vendasPorHora = {};
    for (var h = 6; h <= 23; h++) {
      var hStr = (h < 10 ? '0' : '') + h + ':00';
      vendasPorHora[hStr] = 0;
    }

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
          if (formasPagamentoHoje[forma] !== undefined) {
            formasPagamentoHoje[forma] += valorLiq;
          } else {
            formasPagamentoHoje[forma] = valorLiq;
          }

          if (dataVenda.length >= 16) {
            var hora = dataVenda.substring(11, 13) + ':00';
            if (vendasPorHora[hora] !== undefined) {
              vendasPorHora[hora] += valorLiq;
            }
          }
        }
      }
    });

    var ticketMedioHoje = vendasHojeQtd > 0 ? (faturamentoHoje / vendasHojeQtd) : 0;

    // Contagem de alertas de estoque
    var alertasEstoque = 0;
    var produtosEstoqueZerado = 0;
    produtos.forEach(function(p) {
      var estAtual = parseFloat(p.estoque_atual) || 0;
      var estMin = parseFloat(p.estoque_minimo) || 0;
      if (estAtual <= estMin) alertasEstoque++;
      if (estAtual <= 0) produtosEstoqueZerado++;
    });

    // Ranking de produtos mais vendidos
    var produtosVendidosMap = {};
    itens.forEach(function(it) {
      if (vendasValidasIds[it.venda_id]) {
        var pId = it.produto_id;
        var pNome = it.nome_produto || 'Produto';
        var qtd = parseFloat(it.quantidade) || 0;
        var subtotal = parseFloat(it.subtotal) || 0;

        if (!produtosVendidosMap[pId]) {
          produtosVendidosMap[pId] = { nome: pNome, quantidade: 0, total: 0 };
        }
        produtosVendidosMap[pId].quantidade += qtd;
        produtosVendidosMap[pId].total += subtotal;
      }
    });

    var rankingProdutos = [];
    for (var key in produtosVendidosMap) {
      rankingProdutos.push(produtosVendidosMap[key]);
    }
    rankingProdutos.sort(function(a, b) { return b.quantidade - a.quantidade; });
    var top5Produtos = rankingProdutos.slice(0, 5);

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
      topProdutos: top5Produtos
    };
  }

  return {
    getDashboardMetrics: getDashboardMetrics
  };
})();
