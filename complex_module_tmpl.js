
  var FEST_HTML_CHARS_TEST = /[&<>"]/;
  var FEST_HTML_CHARS = /[&<>"]/g;
  var FEST_HTML_HASH = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;'
  };


  function ESCAPE_HTML(s) {
    if (typeof s === 'string') {
      if (FEST_HTML_CHARS_TEST.test(s)) {
        return s.replace(FEST_HTML_CHARS, FEST_REPLACE_HTML);
      }
    } else if (typeof s === 'undefined') {
      return '';
    }
    return s;
  }

  function FEST_REPLACE_HTML(chr) {
    return FEST_HTML_HASH[chr]
  }


  var FEST_JS_CHARS_TEST = /[\\'"\/\n\r\t\b\f<>]/g;
  var FEST_JS_CHARS = /[\\'"\/\n\r\t\b\f<>]/g;
  var FEST_JS_HASH = {
    '"': '\"',
    '\\': '\\',
    '/': '\\/',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\b': '\\b',
    '\f': '\\f',
    '\'': '\\\'',
    '<': '\\u003C',
    '>': '\\u003E'
  };

  function ESCAPE_JS(s) {
    if (typeof s === 'string') {
      if (FEST_JS_CHARS_TEST.test(s)) {
        return s.replace(FEST_JS_CHARS, FEST_REPLACE_JS);
      }
    } else if (typeof s === 'undefined') {
      return '';
    }
    return s;
  }

  function FEST_REPLACE_JS(chr) {
    return FEST_JS_HASH[chr]
  }
  var FEST_TEMPLATES = {__TEMPLATES__};
  
  module.exports =  FEST_TEMPLATES;
  
