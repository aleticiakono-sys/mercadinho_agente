/**
 * Mercadinho Inteligente - ConfigService
 * Gestão de parâmetros e configurações do estabelecimento.
 */

var ConfigService = (function() {
  function getConfiguracoes() {
    var sheet = Database.getSheet(Database.SHEET_CONFIG);
    var rows = Database.sheetToObjects(sheet);
    var map = {};
    rows.forEach(function(r) {
      if (r.chave) {
        map[r.chave] = r.valor;
      }
    });
    return map;
  }

  function getValor(chave, valorPadrao) {
    var configs = getConfiguracoes();
    return configs[chave] !== undefined ? configs[chave] : valorPadrao;
  }

  function salvarConfiguracoes(novasConfigs) {
    var sheet = Database.getSheet(Database.SHEET_CONFIG);
    var rows = Database.sheetToObjects(sheet);
    var existingKeys = {};

    rows.forEach(function(r) {
      existingKeys[r.chave] = r._rowIndex;
    });

    for (var chave in novasConfigs) {
      if (novasConfigs.hasOwnProperty(chave)) {
        var valorSanitizado = SecurityUtils.sanitizeForSheet(novasConfigs[chave]);
        if (existingKeys[chave]) {
          sheet.getRange(existingKeys[chave], 2).setValue(valorSanitizado);
        } else {
          sheet.appendRow([SecurityUtils.sanitizeForSheet(chave), valorSanitizado, 'Configuração personalizada']);
        }
      }
    }

    return { sucesso: true, mensagem: 'Configurações atualizadas com sucesso.' };
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
    getValor: getValor,
    salvarConfiguracoes: salvarConfiguracoes,
    getNextNumeroCupom: getNextNumeroCupom
  };
})();
