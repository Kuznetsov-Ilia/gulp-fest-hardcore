
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
  var FEST_TEMPLATES = {/*module.exports =*/
'new' : function (params) {
  var __params0__ = {};               ;var __expr1__ = "";                                if (args.commentPage) {                                                                              __expr1__ = "<div class=\"container-for-comments "+ESCAPE_HTML(active)+"\"></div>"                             }else if (args.poll) {                     var __expr2__ = "";                                if (args.owner && !args.poll.total_voted && args.state != 'R') {                                        var __params3__ = {};                                                     __expr2__ = FEST_TEMPLATES["page-question-empty"](__params3__)                                                              }                        __expr1__ = "<div class=\"container-for-poll\"></div>"+__expr2__               }else {  var __expr4__ = "";                                if (args.owner && !+args.anscnt && args.state != 'R') {                                        var __params5__ = {};                                                     __expr4__ = FEST_TEMPLATES["page-question-empty"](__params5__)                                                              }                          __expr1__ = "<div class=\"container-for-answers\"></div><div class=\"adv-slot-3216\"></div>"+__expr4__                 };var d = document.createElement('div');
  d.innerHTML = template(args);
  setBingings(d);
  d.set = function(key, value) {
    d._textNodes[key].nodeValue = value;
  }
  d.get = function() {

  }
  return d;

  function setBingings(root) {
    var originalNode = root.childNodes[0].childNodes[0];
    var originalNodeValue = originalNode.nodeValue
    var atexts = originalNodeValue.split('{text}');
    var textIndex = atexts.indexOf('');
    var f = document.createDocumentFragment();
    if (textIndex == 0) {
      var textNode = document.createTextNode('');
      var otherNode = document.createTextNode(atexts[1]);
      f.appendChild(textNode);
      f.appendChild(otherNode);
    }
    if (textIndex == 1) {
      var textNode = document.createTextNode('');
      var otherNode = document.createTextNode(atexts[0]);
      f.appendChild(otherNode);
      f.appendChild(textNode);
    }
    if (textIndex == -1) {
      var textNode = document.createTextNode('');
      var firstNode = document.createTextNode(atexts[0]);
      var lastNode = document.createTextNode(atexts[1]);
      f.appendChild(firstNode);
      f.appendChild(textNode);
      f.appendChild(lastNode);
    }
    originalNode.parentNode.replaceChild(f, originalNode);

    root._textNodes['text'] = textNode;
  }
  return "<div class=\"page-question hfeed\">{text}\n  Трали вали"+FEST_TEMPLATES["page-question-head"](__params0__)                                 +__expr1__+"<div class=\"container-for-similar\" name=\"clb"+ESCAPE_HTML(args.rbSimilar)+"\"></div><div class=\"h-title h-title-rbseo\"><div class=\"h-title--w\"><strong class=\"h-title--b\" style=\"margin-left: 20px;\">Также спрашивают</strong></div></div><div class=\"rbseo\"></div></div>"
},
};
  
  module.exports =  FEST_TEMPLATES;
  
