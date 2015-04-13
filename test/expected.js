var d = document.createElement('div');
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




  module.exports = function(){
    // utils

    function set(key, value) {
      if (key in _if) {
        var node = _if[key];
        if (value) {
          node.parent.replaceChild(node.placeholder, node.value);
        } else {
          node.parent.replaceChild(node.placeholder, node.empty);
        }
      };
      if (key in _textNodes) {
        _textNodes[key].nodeValue = value;
      } else if (key in _htmlNodes) {
        _htmlNodes[key].innerHTML = value;
      } else {

      }
    }
    function get(key) {
      if (key in _textNodes) {
        return _textNodes[key];
      } else if (key in _htmlNodes) {
        return _htmlNodes[key];
      } else {
        return;
      }
    }
    var TEMPLATES = {};
    TEMPLATES['new'] = function(){
      var html = '\
      <div class="page-question hfeed">\
        <b>dddd</b>
        $1 <- [ {text}, Трали вали ]
        <div>
          $2 <- [ {page-question-head}, {isCommentPage} ]
        </div>
        $3 <- [ {isPoll}, {isQuestion}]
        <div class="container-for-similar" name="{$4}"></div> <- {clbSimilar}
        $5 <- [ {rbseo} ]
        <div class="rbseo"></div>
      ';

      var getTemplate = initTemplate;

      function initTemplate () {
        var div = document.createElement('div');
        div.innerHTML = html;
        var _textNodes = {};
        var f = document.createDocumentFragment();
        var root = div.childNodes[0];
        [
          { text:'', type: 'text', name: text2 },
          { text: 'Трали вали', type: 'text' }
        ].each(function(i) {
          var textNode = document.createTextNode(i.text);
          f.appendChild(textNode);
          if (i.name) {
            _textNodes[i.name] = textNode;
          }
        })
        root.replaceChild(root.childNodes[1], f)

        var templates = {};
        var f = document.createDocumentFragment();
        var root = div.childNodes[0].childNodes[2];
        [
          { text: '', name: 'page-question-head', type: 'template'},
          { text: '', name: 'isCommentPage', type: 'html', condition: 'if'}
        ].each(function(text) {
          var Node;
          switch(item.type) {
            case 'text' :
              Node = document.createTextNode(i.text);
              if (i.name) {
                _textNodes[i.name] = Node;
              }
            break;
            case 'html' :
              Node = document.createTextNode('');
              if (i.condition == 'if') {
                _if[item.name] = Node;
              }
            break;
            case 'template' :
              Node = templates[name] = TEMPLATES[name]();

            break;
          }
          f.appendChild(Node);
        });
        root.replaceChild(root.childNodes[0], f);

        getTemplate = getTemplateFromCache(root);

        return root;
      }

      function getTemplateFromCache(root){
        return function (){
          return root
        }
      }

      return getTemplate;


      /*var __params0__ = {};;
      var __expr1__ = "";
      if (args.commentPage) {
        __expr1__ = "<div class=\"container-for-comments " + ESCAPE_HTML(active) + "\"></div>"
      } else if (args.poll) {
        var __expr2__ = "";
        if (args.owner && !args.poll.total_voted && args.state != 'R') {
          var __params3__ = {};
          __expr2__ = FEST_TEMPLATES["page-question-empty"](__params3__)
        }
        __expr1__ = "<div class=\"container-for-poll\"></div>" + __expr2__
      } else {
        var __expr4__ = "";
        if (args.owner && !+args.anscnt && args.state != 'R') {
          var __params5__ = {};
          __expr4__ = FEST_TEMPLATES["page-question-empty"](__params5__)
        }
        __expr1__ = "<div class=\"container-for-answers\"></div><div class=\"adv-slot-3216\"></div>" + __expr4__
      };*/
    }
    return TEMPLATES;
  }
