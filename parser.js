var sax = require('sax');
var log = console.error;
var fs = require('fs');

module.exports = Parser;

function Parser() {
  var parser = sax.parser(false, {
    trim: true,
    xmlns: true,
    lowercase: true,
    //noscript: true
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
  var output = fs.readFileSync(__dirname + '/tmpl-require.js').toString()
    .replace(/__VARS__/, this.parser.expressions.join(';') || '')
    .replace(/__SOURCE__/, this.parser.source.join('+') || '""');

  output = output.replace(/"\+"/g, '');

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
    var attrs = compileAttributes(node.attributes);
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
    openScope(this, node);
    return;
  case 'value':
    if (node.attributes.escape) {
      switch (node.attributes.escape.value) {
      case 'html':
        this.source.push('$.escapeHTML(');
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
  case 'set':
    return;
  case 'get':
    var tmpName = node.attributes.select ?
      _getAttr(node, 'select', 'expr') : _getAttr(node, 'name')
    var caseGetName = ['<<', 'get', tmpName, '>>'].join('-');
    this.source.push(caseGetName);
    return;
  case 'insert':
    return;
  case 'include':
    return;
  case 'var':
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
    this.source.push((this.source.pop() || '') +
      ',getParams.{name} = {value}'
      .replace('{name}', node.attributes.name.value)
      .replace('{value}', node.attributes.value ? _getAttr(node, 'value', 'var') : (node.attributes.select ? '(' + _getAttr(node, 'select', 'expr') + ')' : '""'))
    );
    return;
  case 'params':
    this.source.push(',$.extend(getParams, ');
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
    var expr = node.innerExpressions.join(';') || '';
    var source = node.innerSource.join('+') || '""';
    this.expressions.push(
      'var expr# = "";'                   .replace('#', node.exprCnt) +
      'if ( {list} && {list}.length ) {'  .replace(/\{list\}/g, list) +
      '  for (var {i} = 0, {i}l = {list}.length; {i} < {i}l ; {i}++) {'
                                          .replace('{list}', list)
                                          .replace(/\{i\}/g, i) +
      '    var {value} = {list}[{i}];'    .replace('{list}', list)
                                          .replace('{i}', i)
                                          .replace('{value}', value) +
      '    {expressions}'                 .replace('{expressions}',expr) +
      '    expr# += {source}'             .replace('#', node.exprCnt)
                                          .replace('{source}', source) +
      '  }' +
      '}'
    );
    return;
  case 'switch':
    //this.source.push('expr' + node.exprCnt);
    closeScope(this, node);
    var test = _getAttr(node, 'test', 'expr');
    var expressions = node.innerExpressions.join(';') || '';
    var source = node.innerSource.join('+') || '';
    this.expressions.push(
      'var expr# = "";'       .replace('#', node.exprCnt) +
      'switch ({test}) {'     .replace('{test}', test) +
      '  {expressions}'       .replace('{expressions}', expressions) +
      '  {source}'            .replace('{source}', source) +
      '}'
    );
    return;
  case 'if':
    closeScope(this, node);
    var test = _getAttr(node, 'test', 'expr');
    var expressions = node.innerExpressions.join(';') || '';
    var source = node.innerSource.join('+') || '""';
    this.expressions.push(
      'var expr# = "";'         .replace('#', node.exprCnt) +
      'if ({test}) {'           .replace('{test}', test) +
      '  {expressions}'         .replace('{expressions}', expressions)+
      '  expr# = {source}'      .replace('#', node.exprCnt)
                                .replace('{source}', source) +
      '}'
    );
    return;
  case 'elseif':
    closeScope(this, node);
    var test = _getAttr(node, 'test', 'expr');
    var expressions = node.innerExpressions.join(';') || '';
    var source = node.innerSource.join('+') || '""';
    this.expressions.push(
      (this.expressions.pop() || '') +
      'else if ({test}) {'      .replace('{test}', test) +
      '  {expressions}'         .replace('{expressions}', expressions)+
      '  expr# = {source}'      .replace('#', node.exprCnt)
                                .replace('{source}', source) +
      '}'
    );
    return;
  case 'else':
    closeScope(this, node);
    var expressions = node.innerExpressions.join(';') || '';
    var source = node.innerSource.join('+') || '""';
    this.expressions.push(
      (this.expressions.pop() || '') +
      'else {' +
      '  {expressions}'         .replace('{expressions}', expressions)+
      '  expr# = {source}'      .replace('#', node.exprCnt)
                                .replace('{source}', source) +
      '}'
    );
    return;
  case 'case':
    closeScope(this, node);
    var val = _getAttr(node, 'is', 'expr');
    var expressions = node.innerExpressions.join(';') || '';
    var source = node.innerSource.join('+') || '""';
    this.expressions.push(
      (this.expressions.pop() || '') +
      'case {val}: '        .replace('{val}', val) +
      '  {expressions}'     .replace('{expressions}', expressions)+
      '  expr# = {source}'  .replace('#', node.exprCnt)
                            .replace('{source}', source) +
      ';break;'
    );
    return;
  case 'default':
    closeScope(this, node);
    var expressions = node.innerExpressions.join(';') || '';
    var source = node.innerSource.join('+') || '""';
    this.expressions.push(
      (this.expressions.pop() || '') +
      'default: ' +
      '  {expressions}'     .replace('{expressions}', expressions) +
      '  expr# = {source}'  .replace('#', node.exprCnt)
                            .replace('{source}', source) +
      ';break;'
    );
    return;
  case 'value':
    if (node.attributes.escape) {
      switch (node.attributes.escape.value) {
      case 'html':
      case 'js':
      case 'json':
        this.source.push(')');
        break;
      }
    }
    return;
  case 'set':
    return;
  case 'get':
    var caseGetName = ['<<', 'get', (
      node.attributes.select ?
      _getAttr(node, 'select', 'expr') :
      _getAttr(node, 'name')
    ), '>>'].join('-');

    var getSource = [];
    while (getSource[0] !== caseGetName) {
      getSource.unshift(this.source.pop());
    }
    getSource.shift(); // выкидываем caseGetName
    var onTextParamed = getSource.length < 2; // был ли только текст и никаких params\param

    if (!onTextParamed) {
      this.expressions.push('var getParams={};');
    }

    this.source.push(
      '{return} require({name})({getParams={},}{params}{,getParams})'
      .replace('{return}', node.attributes.
        return ?'return': '')
      .replace('{name}', node.attributes.select ? _getAttr(node, 'select', 'expr') : ('"' + _getAttr(node, 'name') + '-template"'))
      .replace('{getParams={},}', onTextParamed ? '' : 'getParams={}')
      .replace('{params}', getSource.join('+'))
      .replace('{,getParams}', onTextParamed ? '' : ',getParams')
    );

    return;
  case 'params':
    var paramsSource = [];
    paramsSource.unshift(this.source.pop());
    while (paramsSource[0] !== ',$.extend(getParams, ') {
      paramsSource.unshift(this.source.pop());
    }
    paramsSource.push(')');
    this.source.push(paramsSource.join(''));
    return;

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
  case 'var':
  case 'value':
  case 'param':
  case 'params':
    var tmpExpr = _getExpr(text);
    if (/^[a-z_\.\[\]\"\'$]+$/i.test(tmpExpr)) {
      this.source.push(tmpExpr);
    } else {
      this.source.push('(' + tmpExpr + ')');
    }
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
    node.exprCnt = _this.prevClosed.exprCnt; //getPrevClosed(_this).exprCnt;
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
    _this.source.push('expr' + node.exprCnt);
  break;
  }
  node.expressions = _this.expressions;
  node.source = _this.source;
  node.parent = _this.parent;
  //node.prev = _this.prev;
  _this.expressions = [];
  _this.source = [];
  _this.parent = node;
  _this.prevOpened = node;
}

function closeScope(_this, node) {
  /*switch (node.local) {
  case 'if':
  case 'for':
  case 'switch':
    node.exprCnt = _this.exprCnt;
    _this.exprCnt++;
    break;
  }*/

  node.innerSource = _this.source;
  node.innerExpressions = _this.expressions;
  _this.source = node.source;
  _this.expressions = node.expressions;
  _this.parent = node.parent;
  _this.prevClosed = node;
}


/*function getName(name) {
  if (/^[a-zA-Z_]+$/.test(name)) {
    return '.' + name;
  } else {
    return '["' + escapeJS(name) + '"]';
  }
}*/

function getPrevClosed(_this, name) {
  log('getPrevClosed', _this.name, name);
  while (_this.name === name) {
    _this = _this.prevClosed;
  }
  log('found', _this.name);
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
    return value;
  }
}

function compileAttributes(attrs) {
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
            result.text += '"+$.escapeHTML(' + result.expr[n] + ')+"';
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
var nsTags = 'doctype,comment,cdata,n,space,if,else,elseif,switch,case,default,value,insert,for,set,get,include,param,params,var,vars,script'.split(',');
