/**
 * Mercadinho Inteligente - Code (Ponto de Entrada do Google Apps Script)
 * Controlador Web App e RPC Dispatcher.
 */

/**
 * Manipulador GET - Renderiza a aplicação SPA moderna (UI+).
 */
function doGet(e) {
  // Garantir que a base de dados esteja inicializada
  Database.setupDatabase();

  var template = HtmlService.createTemplateFromFile('Index');
  var htmlOutput = template.evaluate()
    .setTitle('Mercadinho Inteligente | PDV & Estoque')
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/3081/3081840.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  return htmlOutput;
}

/**
 * Função utilitária para inclusão modular de arquivos HTML (Styles, Scripts, Modals).
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* =========================================================================
   FUNÇÕES RPC DISPONÍVEIS PARA O FRONTEND (google.script.run)
   ========================================================================= */

/**
 * Carrega todos os dados iniciais para hidratação rápida da SPA.
 */
function apiGetInitialData() {
  try {
    Database.setupDatabase();
    var produtos = ProdutosService.getProdutos(false);
    var configuracoes = ConfigService.getConfiguracoes();
    var dashboard = DashboardService.getDashboardMetrics();
    var usuario = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'operador@gmail.com';

    return {
      sucesso: true,
      produtos: produtos,
      configuracoes: configuracoes,
      dashboard: dashboard,
      usuario: usuario
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao carregar dados iniciais.'
    };
  }
}

/**
 * Salva ou atualiza um produto.
 */
function apiSalvarProduto(produtoDTO) {
  try {
    var resultado = ProdutosService.salvarProduto(produtoDTO);
    var produtosAtualizados = ProdutosService.getProdutos(false);
    return {
      sucesso: true,
      mensagem: resultado.mensagem,
      produtos: produtosAtualizados
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao salvar produto.'
    };
  }
}

/**
 * Ajusta estoque de forma rápida.
 */
function apiAjustarEstoque(produtoId, quantidadeAjuste, motivo) {
  try {
    var resultado = ProdutosService.ajustarEstoque(produtoId, quantidadeAjuste, motivo);
    var produtosAtualizados = ProdutosService.getProdutos(false);
    return {
      sucesso: true,
      mensagem: resultado.mensagem,
      produtos: produtosAtualizados
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao ajustar estoque.'
    };
  }
}

/**
 * Finaliza a venda e emite o cupom térmico.
 */
function apiRegistrarVenda(vendaDTO) {
  try {
    var resultado = VendasService.registrarVenda(vendaDTO);
    var produtosAtualizados = ProdutosService.getProdutos(false);
    var dashboardAtualizado = DashboardService.getDashboardMetrics();

    return {
      sucesso: true,
      venda: resultado.venda,
      itens: resultado.itens,
      cupomHtml: resultado.cupomHtml,
      mensagem: resultado.mensagem,
      produtos: produtosAtualizados,
      dashboard: dashboardAtualizado
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao finalizar venda.'
    };
  }
}

/**
 * Obtém o histórico de vendas.
 */
function apiGetHistoricoVendas(dataFiltro) {
  try {
    var historico = VendasService.getHistoricoVendas(dataFiltro);
    return {
      sucesso: true,
      vendas: historico
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao buscar histórico de vendas.'
    };
  }
}

/**
 * Cancela uma venda e restaura os saldos de estoque.
 */
function apiCancelarVenda(vendaId) {
  try {
    var resultado = VendasService.cancelarVenda(vendaId);
    var produtosAtualizados = ProdutosService.getProdutos(false);
    var dashboardAtualizado = DashboardService.getDashboardMetrics();
    return {
      sucesso: true,
      mensagem: resultado.mensagem,
      produtos: produtosAtualizados,
      dashboard: dashboardAtualizado
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao cancelar venda.'
    };
  }
}

/**
 * Atualiza as configurações do estabelecimento.
 */
function apiSalvarConfiguracoes(configDTO) {
  try {
    var resultado = ConfigService.salvarConfiguracoes(configDTO);
    var configs = ConfigService.getConfiguracoes();
    return {
      sucesso: true,
      mensagem: resultado.mensagem,
      configuracoes: configs
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao salvar configurações.'
    };
  }
}

/**
 * Re-emite o HTML do cupom térmico para uma venda passada.
 */
function apiReimprimirCupom(vendaId) {
  try {
    var vendas = VendasService.getHistoricoVendas(null);
    var venda = null;
    for (var i = 0; i < vendas.length; i++) {
      if (vendas[i].id === vendaId) {
        venda = vendas[i];
        break;
      }
    }
    if (!venda) throw new Error('Venda não encontrada.');

    var config = ConfigService.getConfiguracoes();
    var cupomHtml = CupomFiscalService.gerarHtmlCupom(venda, venda.itens, config);

    return {
      sucesso: true,
      cupomHtml: cupomHtml
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err.message || 'Erro ao reimprimir cupom.'
    };
  }
}
