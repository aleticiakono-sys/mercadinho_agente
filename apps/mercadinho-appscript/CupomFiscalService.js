/**
 * Mercadinho Inteligente - CupomFiscalService
 * Geração de Cupom Térmico (58mm / 80mm) e QR Code Pix.
 */

var CupomFiscalService = (function() {
  /**
   * Gera o HTML estruturado do Cupom Fiscal / Cupom Não Fiscal para impressão térmica.
   */
  function gerarHtmlCupom(venda, itens, config) {
    config = config || ConfigService.getConfiguracoes();
    var nomeLoja = SecurityUtils.escapeHtml(config.NOME_FANTASIA || 'MERCADINHO & CONVENIÊNCIA');
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
      var subtotal = SecurityUtils.formatMoney(item.subtotal);
      var unitario = SecurityUtils.formatMoney(item.preco_unitario);
      rowsHtml += '<tr>' +
        '<td style="text-align:left; padding: 2px 0;">' + (i + 1) + '. ' + SecurityUtils.escapeHtml(item.nome_produto) + '<br>' +
        '<span style="font-size: 10px; color: #555;">' + item.quantidade + ' x ' + unitario + '</span></td>' +
        '<td style="text-align:right; vertical-align: top; padding: 2px 0;">' + subtotal + '</td>' +
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

    var html = '<div class="cupom-thermal-wrapper" style="font-family: \'Courier New\', Courier, monospace; font-size: 12px; line-height: 1.2; width: 100%; max-width: 300px; margin: 0 auto; color: #000; padding: 10px; background: #fff;">' +
      '<div style="text-align:center; font-weight:bold; font-size: 14px; margin-bottom: 2px;">' + nomeLoja + '</div>' +
      (docLoja ? '<div style="text-align:center; font-size: 11px;">CNPJ/CPF: ' + docLoja + '</div>' : '') +
      (enderecoLoja ? '<div style="text-align:center; font-size: 10px;">' + enderecoLoja + '</div>' : '') +
      (telLoja ? '<div style="text-align:center; font-size: 10px;">Tel: ' + telLoja + '</div>' : '') +
      '<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>' +
      '<div style="text-align:center; font-weight:bold; font-size: 11px; margin-bottom: 4px;">EXTRATO NÃO FISCAL DE VENDA</div>' +
      '<div style="display:flex; justify-content:space-between; font-size: 11px;">' +
        '<span>CUPOM: <b>' + venda.numero_cupom + '</b></span>' +
        '<span>' + dataFormatada + '</span>' +
      '</div>' +
      '<div style="font-size: 10px; color: #444; margin-bottom: 4px;">Operador: ' + SecurityUtils.escapeHtml(venda.operador || 'Caixa Principal') + '</div>' +
      '<div style="border-top: 1px dashed #000; margin: 6px 0;"></div>' +
      '<table style="width:100%; font-size: 11px; border-collapse: collapse;">' +
        '<thead>' +
          '<tr style="border-bottom: 1px solid #000;">' +
            '<th style="text-align:left; padding-bottom: 2px;">ITEM / QTD x UN</th>' +
            '<th style="text-align:right; padding-bottom: 2px;">TOTAL</th>' +
          '</tr>' +
        '</thead>' +
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
      '<div style="text-align:center; font-size: 9px; margin-top: 4px; color: #666;">Sistema Mercadinho Inteligente - Google Apps Script</div>' +
    '</div>';

    return html;
  }

  return {
    gerarHtmlCupom: gerarHtmlCupom
  };
})();
