/**
 * Mercadinho Inteligente - SecurityUtils
 * Utilitários de segurança, validação e sanitização de dados para Google Apps Script.
 */

var SecurityUtils = (function() {
  /**
   * Sanitiza strings para prevenir Formula Injection (CSV / Spreadsheet Injection) no Google Sheets.
   * Strings iniciadas por =, +, -, @, \t, \r são prefixadas com um apóstrofo (') seguro.
   */
  function sanitizeForSheet(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    
    var str = String(value).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      return "'" + str;
    }
    return str;
  }

  /**
   * Escapa caracteres HTML para prevenir Cross-Site Scripting (XSS) no frontend.
   */
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Valida e formata número positivo.
   */
  function parsePositiveNumber(value, defaultValue) {
    defaultValue = defaultValue || 0;
    var num = parseFloat(value);
    if (isNaN(num) || num < 0) return defaultValue;
    return Number(num.toFixed(2));
  }

  /**
   * Gera um UUIDv4 simplificado para IDs únicos no Sheets.
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Formata moeda no padrão brasileiro (R$).
   */
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
