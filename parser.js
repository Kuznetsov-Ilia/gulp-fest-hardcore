var sax = require('sax');
var log = console.error;
var fs = require('fs');

module.exports = Parser;

function Parser(lang) {
  var parser = sax.parser(false, {
    trim: true,
    xmlns: true,
    lowercase: true
  });
  parser.onopentag = onopentag;
  parser.onclosetag = onclosetag;
  parser.onerror = onerror;
  parser.oncdata = oncdata;
  parser.ontext = ontext;

  parser.onscript = onscript;

  //parser.onattribute = onattribute;
  parser.onend = onend;
  parser.expressions = [];
  parser.exprCnt = 0;
  parser.source = [];
  parser.stack = [];
  parser.fstack = [];

  parser.lang = lang || 'js';

  this.parser = parser;
}

Parser.prototype.write = function (xmlString, filepath) {
  _getEval = getEval(xmlString, this.parser, filepath);
  _getExpr = getExpr(xmlString, this.parser, filepath);
  _getAttr = getAttr(xmlString, this.parser, filepath);

  this.parser.write(xmlString).close();
  return this;
}
var _getEval, _getExpr, _getAttr;

Parser.prototype.getSource = function () {
  var output;
  if (this.parser.lang === 'lua') {
    output = fs.readFileSync(__dirname + '/tmpl.lua').toString()
      .replace(/__VARS__/, this.parser.expressions.join('\n') || '')
      .replace(/__SOURCE__/, this.parser.source.join('..') || '""')
      .replace(/"\.\."/g, '');
  } else {
    output = fs.readFileSync(__dirname + '/tmpl.js').toString()
      .replace(/__VARS__/, this.parser.expressions.join(';') || '')
      .replace(/__SOURCE__/, this.parser.source.join('+') || '""')
      .replace(/"\+"/g, '');
  }

  return new Buffer(output);
}


function escapeJS(s) {
  return s.replace(jschars, function (chr) {
    return jshash[chr];
  });
}

function escapeHTML(s) {
  return s.replace(htmlchars, function (chr) {
    return htmlhash[chr];
  });
}


function onerror(e) {
  // an error happened.
  log('error!', e)
}

function onopentag(node) {
  this.stack.push(node.local);
  if (nsTags.indexOf(node.local) === -1) {
    var attrs = compileAttributes(node.attributes, this.lang);
    //opentag = true;
    this.source.push(
      '"<{name}{attrs}{selfclosed}>"'
      .replace('{name}', node.name)
      .replace('{attrs}', attrs.text)
      .replace('{selfclosed}', node.isSelfClosing ? '/' : '')
    );
    return;
  } else {
    this.fstack.push(node);
  }


  switch (node.local) {
  case 'doctype':
    this.source.push('"<!DOCTYPE "');
    return;
  case 'comment':
    this.source.push('"<!--"');
    return;
  case 'cdata':
    this.source.push('"<![CDATA["');
    return;
  case 'n':
    this.source.push('"\n"');
    return;
  case 'space':
    this.source.push('" "');
    return;
  case 'switch':
  case 'case':
  case 'default':
  case 'for':
  case 'if':
  case 'elseif':
  case 'else':
  case 'set':
  case 'get':
  case 'require':
    openScope(this, node);
    return;
  case 'value':
    if (node.attributes.escape) {
      switch (node.attributes.escape.value) {
      case 'html':
        if (this.lang === 'lua') {
          this.source.push('U.escapeHTML(');
        } else {
          this.source.push('$.escapeHTML(');
        }
        break;
      case 'js':
        this.source.push('$.escapeJS(');
        break;
      case 'json':
        this.source.push('$.escapeJSON(');
        break;
      }
    }
    return;
  case 'insert':
  case 'include':
  case 'var':
    log(node.local, 'isnot implemented');
    return;
  case 'vars':
    var vars = [];
    for (var i in node.attributes) {
      if (node.attributes[i].value === '') {
        vars.push(node.attributes[i].value)
      } else {
        vars.push('{name}={value}'
          .replace('{name}', i)
          .replace('{value}', node.attributes[i].value)
        );
      }
    }
    this.expressions.push('var {vars};'
      .replace('{vars}', vars.join(','))
    );
    return;
  case 'param':
    var value = '';
    if (node.attributes.value) {
      value = _getAttr(node, 'value', 'var');
    } else if (node.attributes.select) {
      value = '(' + _getAttr(node, 'select', 'expr') + ')';
    }

    if (value) {
      this.source.push(
        (this.source.pop() || '') +
        '__params#__.{name} = {value};'.replace('#', this.parent.exprCnt).replace('{name}', node.attributes.name.value).replace('{value}', value)
      );
    } else {
      this.source.push(
        this.source.pop() || '' +
        ';__params#__.{name} = ""'.replace('#', this.parent.exprCnt).replace('{name}', node.attributes.name.value)
      );
    }
    return;
  }
}

function onclosetag() {
  var node = this.tag;

  //opentag = closetag(node.local, opentag);

  this.stack.pop();
  if (nsTags.indexOf(node.local) === -1) {
    this.stack.pop();
    if (!(node.name in short_tags)) {
      this.source.push('"</#>"'.replace('#', node.name));
    }
    return;
  } else {
    this.fstack.pop();
  }
  switch (node.local) {
  case 'doctype':
    this.source.push('">"');
    return;
  case 'comment':
    this.source.push('"-->"');
    return;
  case 'cdata':
    this.source.push('"]]>"');
    return;
  case 'for':
    closeScope(this, node);
    var list = _getAttr(node, 'iterate', 'expr');
    var i = _getAttr(node, 'index', 'var');
    var value = _getAttr(node, 'value');
    if (this.lang === 'lua') {
      var expr = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '""';
      this.expressions.push(
        'local __expr#__ = ""\n                         \n'.replace('#', node.exprCnt) +
        'if {list} and next({list}) then\n              \n'.replace(/\{list\}/g, list) +
        '  __expr#__ = {}\n                             \n'.replace('#', node.exprCnt) +
        '  for {i}, {value} in ipairs({list}) do\n      \n'.replace('{i}', i).replace('{value}', value).replace('{list}', list) +
        '    {expressions}\n                            \n'.replace('{expressions}', expr) +
        '    table.insert(__expr#__, {source})\n        \n'.replace('#', node.exprCnt).replace('{source}', source) +
        '  end\n' +
        '  __expr#__ = table.concat(__expr#__)\n        \n'.replace(/#/g, node.exprCnt) +
        'end\n'
      );
    } else {
      var expr = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '""';
      this.expressions.push(
        'var __expr#__ = "";                            '.replace('#', node.exprCnt) +
        'if ( {list} && {list}.length ) {               '.replace(/\{list\}/g, list) +
        '  for (var {i} = 0, {i}l = {list}.length; {i} < {i}l ; {i}++) {'.replace('{list}', list).replace(/\{i\}/g, i) +
        '    var {value} = {list}[{i}];                 '.replace('{list}', list).replace('{i}', i).replace('{value}', value) +
        '    {expressions}                              '.replace('{expressions}', expr) +
        '    __expr#__ += {source}                      '.replace('#', node.exprCnt).replace('{source}', source) +
        '  }' +
        '}'
      );
    }
    return;
  case 'switch':
    closeScope(this, node);
    var test = _getAttr(node, 'test', 'expr');
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '';
      this.expressions.push(
        'local __expr#__ = ""\n                            \n'.replace('#', node.exprCnt) +
        'local __test#__ = {test}\n                        \n'.replace('#', node.exprCnt).replace('{test}', test) +
        '{expressions}\n                                   \n'.replace('{expressions}', expressions) +
        '{source}\n                                        \n'.replace('{source}', source)
      );
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '';
      this.expressions.push(
        'var __expr#__ = "";                              '.replace('#', node.exprCnt) +
        'switch ({test}) {                                '.replace('{test}', test) +
        '  {expressions}                                  '.replace('{expressions}', expressions) +
        '  {source}                                       '.replace('{source}', source) +
        '}'
      );
    }
    return;
  case 'case':
    closeScope(this, node);
    var val = _getAttr(node, 'is', 'expr');
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '""';
      var prevExpr = this.expressions.pop() || '';
      var token;
      if (prevExpr.slice(-4) === 'end\n') {
        prevExpr = prevExpr.slice(0, -4);
        token = 'elseif';
      } else {
        token = 'if';
      }
      this.expressions.push(
        prevExpr +
        '{token} __test#__ == {val} then\n      \n'.replace('{token}', token).replace('#', node.exprCnt).replace('{val}', val) +
        '  {expressions}\n                  \n'.replace('{expressions}', expressions) +
        '  __expr#__ = {source}\n               \n'.replace('#', node.exprCnt).replace('{source}', source) +
        'end\n'
      );
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '""';
      this.expressions.push(
        (this.expressions.pop() || '') +
        'case {val}:                        '.replace('{val}', val) +
        '  {expressions}                    '.replace('{expressions}', expressions) +
        '  __expr#__ = {source};                '.replace('#', node.exprCnt).replace('{source}', source) +
        'break;'
      );
    }
    return;
  case 'default':
    closeScope(this, node);
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '""';
      var prevExpr = this.expressions.pop() || '';
      if (prevExpr.slice(-4) === 'end\n') {
        prevExpr = prevExpr.slice(0, -4);
      }
      this.expressions.push(
        prevExpr +
        'else\n' +
        '  {expressions}\n                   \n'.replace('{expressions}', expressions) +
        '  __expr#__ = {source}\n                \n'.replace('#', node.exprCnt).replace('{source}', source) +
        'end\n'
      );
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '""';
      this.expressions.push(
        (this.expressions.pop() || '') +
        'default: ' +
        '  {expressions}                        '.replace('{expressions}', expressions) +
        '  __expr#__ = {source};                    '.replace('#', node.exprCnt).replace('{source}', source) +
        'break;'
      );
    }
    return;

  case 'if':
    closeScope(this, node);
    var test = _getAttr(node, 'test', 'expr');
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '""';
      this.expressions.push(
        'local __expr#__ = ""\n                             \n'.replace('#', node.exprCnt) +
        'if {test} then\n                               \n'.replace('{test}', test) +
        '  {expressions}\n                              \n'.replace('{expressions}', expressions) +
        '  __expr#__ = {source}\n                           \n'.replace('#', node.exprCnt).replace('{source}', source) +
        'end\n'
      );
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '""';
      this.expressions.push(
        'var __expr#__ = "";                                '.replace('#', node.exprCnt) +
        'if ({test}) {                                  '.replace('{test}', test) +
        '  {expressions}                                '.replace('{expressions}', expressions) +
        '  __expr#__ = {source}                             '.replace('#', node.exprCnt).replace('{source}', source) +
        '}'
      );
    }
    return;
  case 'elseif':
    closeScope(this, node);
    var test = _getAttr(node, 'test', 'expr');
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '""';
      var prevExpr = this.expressions.pop() || '';
      if (prevExpr.slice(-4) === 'end\n') {
        prevExpr.slice(0, -4);
      }
      this.expressions.push(
        prevExpr +
        'elseif {test} then\n             \n'.replace('{test}', test) +
        '  {expressions}\n                \n'.replace('{expressions}', expressions) +
        '  __expr#__ = {source}\n             \n'.replace('#', node.exprCnt).replace('{source}', source) +
        'end\n'
      );
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '""';
      this.expressions.push(
        (this.expressions.pop() || '') +
        'else if ({test}) {               '.replace('{test}', test) +
        '  {expressions}                  '.replace('{expressions}', expressions) +
        '  __expr#__ = {source}               '.replace('#', node.exprCnt).replace('{source}', source) +
        '}'
      );
    }

    return;
  case 'else':
    closeScope(this, node);
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '""';
      var prevExpr = this.expressions.pop() || '';
      if (prevExpr.slice(-4) === 'end\n') {
        prevExpr.slice(0, -4);
      }
      this.expressions.push(
        prevExpr +
        'else\n' +
        '  {expressions}\n                  \n'.replace('{expressions}', expressions) +
        '  __expr#__ = {source}\n               \n'.replace('#', node.exprCnt).replace('{source}', source) +
        'end\n'
      );
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '""';
      this.expressions.push(
        (this.expressions.pop() || '') +
        'else {' +
        '  {expressions}                    '.replace('{expressions}', expressions) +
        '  __expr#__ = {source}                 '.replace('#', node.exprCnt).replace('{source}', source) +
        '}'
      );
    }
    return;
  case 'value':
    if (node.attributes.escape) {
      switch (node.attributes.escape.value) {
      case 'html':
      case 'js':
      case 'json':
        this.source.push(
          (this.source.pop() || '') +
          ')'
        );
        break;
      }
    }
    return;
  case 'set':
    closeScope(this, node);
    var name;
    if (node.attributes.name) {
      name = _getAttr(node, 'name');
    } else if (node.attributes.select) {
      name = _getAttr(node, 'select', 'expr');
    }
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '""';
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '""';
    }

    this.expressions.push(
      'function {name} ({params}){          '.replace('{name}', name).replace('{params}', node.attributes.params ? node.attributes.params.value : 'params') +
      '  {expressions}                      '.replace('{expressions}', expressions) +
      '  return {source}                    '.replace('{source}', source) +
      '}'
    );
    return;
  case 'get':
    closeScope(this, node);
    var name;
    if (node.attributes.name) {
      name = _getAttr(node, 'name');
    } else if (node.attributes.select) {
      name = '__expr#__'.replace('#', node.exprCnt);
      this.expressions.push('var ' + name + '=' + _getAttr(node, 'select', 'expr'));
    }
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '';
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '';
    }
    this.expressions.push(
      'var __params#__ = {params}                 '.replace('#', node.exprCnt).replace('{params}', node.attributes.params ? _getAttr(node, 'params') : '{}')
    );
    if (expressions) {
      this.expressions.push(expressions);
    }
    if (source) {
      this.expressions.push(source);
    }
    this.source.push(
      '{name}(__params#__)                        '.replace('{name}', name).replace('#', node.exprCnt)
    );
    return;
  case 'require':
    closeScope(this, node);
    var name;
    if (node.attributes.name) {
      if (this.lang === 'lua') {
        name = '"templates.' + _getAttr(node, 'name') + '"';
      } else {
        name = '"' + _getAttr(node, 'name') + '-template"';
      }
    } else if (node.attributes.select) {
      name = _getAttr(node, 'select', 'expr');
    }
    if (this.lang === 'lua') {
      var expressions = node.innerExpressions.join('\n') || '';
      var source = node.innerSource.join('..') || '';
    } else {
      var expressions = node.innerExpressions.join(';') || '';
      var source = node.innerSource.join('+') || '';
    }
    this.expressions.push('var __params#__ = {params}               '.replace('#', node.exprCnt).replace('{params}', node.attributes.params ? _getAttr(node, 'params') : '{}'))
    if (expressions) {
      this.expressions.push(expressions);
    }
    if (source) {
      this.expressions.push(source);
    }
    this.source.push(
      'require({name})(__params#__)                                 '.replace('{name}', name).replace('#', node.exprCnt)
    );
    break;
  }
}

function oncdata(text) {
  //  opentag = closetag('text', opentag);
  this.source.push('"' + escapeJS(text) + '"');
}

function onscript(text) {
  this.expressions.push(_getEval(text));
}

function ontext(text) {
  switch (this.stack[this.stack.length - 1]) {
  case 'get':
  case 'params':
  case 'require':
    this.expressions.push(
      '$.extend(__params#__, {params})              '.replace('#', this.parent.exprCnt).replace('{params}', text)
    );
    break;
  case 'value':
    var tmpExpr = _getExpr(text);
    if (this.lang === 'lua') {
      tmpExpr = getLuaExpr(tmpExpr);
    }
    this.source.push(
      (this.source.pop() || '') +
      getName(tmpExpr)
    );
    break;
  default:
    this.source.push('"' + escapeJS(text) + '"');
    break;
  }
}

/*function onattribute(attr) {
  // an attribute.  attr has "name" and "value"
}*/

function onend() {
  // parser stream is done, and ready to have more stuff written to it.
}


function openScope(_this, node) {
  switch (node.local) {
  case 'else':
  case 'elseif':
    node.exprCnt = _this.prevClosed.exprCnt;
    break;
  case 'case':
  case 'default':
    node.exprCnt = _this.parent.exprCnt;
    break;
  case 'if':
  case 'for':
  case 'switch':
    node.exprCnt = _this.exprCnt;
    _this.exprCnt++;
    _this.source.push('__expr#__'.replace('#', node.exprCnt));
    break;
  case 'get':
  case 'require':
    node.exprCnt = _this.exprCnt;
    _this.exprCnt++;
    break;
  }
  node.expressions = _this.expressions;
  node.source = _this.source;
  node.parent = _this.parent;
  _this.expressions = [];
  _this.source = [];
  _this.parent = node;
  _this.prevOpened = node;
}

function closeScope(_this, node) {
  node.innerSource = _this.source;
  node.innerExpressions = _this.expressions;
  _this.source = node.source;
  _this.expressions = node.expressions;
  _this.parent = node.parent;
  _this.prevClosed = node;
}

function getPrevClosed(_this, name) {
  while (_this.name === name) {
    _this = _this.prevClosed;
  }
  return _this;
}

function getEval(compile_file, parser, filepath) {
  return function (value) {
    try {
      (new Function(value));
    } catch (e) {
      throw new Error(errorMessage('node has ' + e, parser.line, compile_file, filepath));
    }
    return value;
  };
}

function getExpr(compile_file, parser, filepath) {
  return function (value, where) {
    try {
      //console.log('before: ', value);
      value = value.replace(/;+\s*$/, '');
      //console.log('after: ', value);
      (new Function('(' + value + ')'));
    } catch (e) {
      //console.error(e);
      throw new Error(errorMessage((where || 'node') + ' has ' + e, parser.line, compile_file, filepath));
    }
    return value;
  }
}

function getAttr(compile_file, parser, filepath) {
  return function (node, attr, type) {
    var value;
    try {
      value = node.attributes[attr].value;
    } catch (e) {
      throw new Error(errorMessage('attribute "' + attr + '" is missing', parser.line, compile_file, filepath));
    }
    if (type === 'expr') {
      try {
        (new Function('(' + value + ')'));
      } catch (e) {
        throw new Error(errorMessage('attribute "' + attr + '" has ' + e, parser.line, compile_file, filepath));
      }
    } else if (type === 'var') {
      if (!reName.test(value)) {
        throw new Error(errorMessage('attribute "' + attr + '" has an invalid identifier', parser.line, compile_file, filepath));
      }
    }
    if (node.lang === 'lua') {
      value = getLuaExpr(value);
    }
    return value;
  }
}

function compileAttributes(attrs, lang) {
  var i, result = {
      'text': '',
      'expr': [],
      'name': []
    }, n = 0,
    attrValue = '';
  for (i in attrs) {
    if (i.slice(-3) === '-if') {
      result.text += ' " + ((' + attrs[i].value + ') ? "' + i.slice(0, -3) + '": "") +"';
    } else {
      attrValue = attrs[i].value.replace(/{{/g, '__DOUBLE_LEFT_CURLY_BRACES__').replace(/}}/g, '__DOUBLE_RIGHT_CURLY_BRACES__');

      result.text += ' ' + i + '=\\"'
      attrValue.match(/{[^}]*}|[^{}]*/g).forEach(function (str) {
        if (str !== '') {
          if (str[0] === '{') {
            result.name[n] = i;
            result.expr[n] = str.slice(1, -1).replace(/__DOUBLE_LEFT_CURLY_BRACES__/g, '{').replace(/__DOUBLE_RIGHT_CURLY_BRACES__/g, '}');
            if (lang === 'lua') {
              result.text += '".. U.escapeHTML(' + getLuaExpr(result.expr[n]) + ') .."';
            } else {
              result.text += '"+$.escapeHTML(' + result.expr[n] + ')+"';
            }
          } else {
            result.text += escapeJS(escapeHTML(str)).replace(/__DOUBLE_LEFT_CURLY_BRACES__/g, '{').replace(/__DOUBLE_RIGHT_CURLY_BRACES__/g, '}');
          }
        }
      });
      result.text += '\\"';
    }
  }
  return result;
}

function errorMessage(msg, badLine, file, filepath) {
  function zeroPadding(s, len) {
    if (s.toString().length >= len) {
      return s + '';
    }
    return String(new Array(len + 1).join('0') + s).slice(-len);
  }

  function numSort(a, b) {
    return a - b;
  }

  function leftWhitespace(s) {
    return s.length - s.trimLeft().length;
  }

  var before = 1,
    after = 1,
    lines = file.split('\n'),
    badPlace = [],
    num = [];

  for (var i = badLine - before; i <= badLine + after; i++) {
    if (lines[i] !== undefined) {
      num.push(i);
    }
  }

  var longest = num.sort(numSort)[num.length - 1].toString().length,
    minWhitespace = num.slice(0)
      .map(function (n) {
        return leftWhitespace(lines[n]);
      })
      .sort(numSort)[0];

  num.forEach(function (n) {
    badPlace.push(
      ('%n%: ' + lines[n].slice(minWhitespace)).replace('%n%', zeroPadding(n + 1, longest))
    );
  });

  return ['', 'file: ' + filepath, badPlace.join('\n'), 'At line ' + zeroPadding(badLine + 1, longest) + ': ' + msg].join('\n');
}


var short_tags = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  wbr: true
};

var jschars = /[\\'"\/\n\r\t\b\f<>]/g;
var htmlchars = /[&<>"]/g;

var jshash = {
  '"': '\\"',
  '\\': '\\\\',
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

var htmlhash = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\"': '&quot;'
};

var reName = /^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[$A-Z\_a-z][$A-Z\_a-z0-9]*$/;
var nsTags = 'doctype,comment,cdata,n,space,if,else,elseif,switch,case,default,value,insert,for,set,get,require,include,param,params,var,vars,script'.split(',');

function getName(name) {
  if (/^[a-z_\.\[\]\"\'$]+$/i.test(name)) {
    return name;
  } else {
    return '(' + name + ')';
  }
}

/* LUA */

function getLuaExpr(val) {
  val = val
    .replace(/\&\&/g, ' and ')
    .replace(/\|\|/g, ' or ')
    .replace(/\!/g, ' not ');

  if (val.indexOf('?') === -1) {
    val = val.replace(/\:/g, '='); // object notation
  } else {
    val = val.replace(/\:/g, ' or '); // ternar operator
  }

  val = val.replace(/\?/g, ' and ')

  return val;
}
