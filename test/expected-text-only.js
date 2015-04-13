  module.exports = function() {
    // utils
    function template(opts) {
      this.html = opts.html;
      this.init = opts.init;
    }
    template.prototype.set = function(key, value) {
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
    template.prototype.get = function(){
      if (key in _textNodes) {
        return _textNodes[key];
      } else if (key in _htmlNodes) {
        return _htmlNodes[key];
      } else {
        return;
      }
    }
    template.prototype.render = function(){

    }
    var TEMPLATES = {};
    TEMPLATES['testing-text'] = function(){
      var html = '\
      <div class="page-question hfeed">\
        <b>fddfd</b>
        <a>$1 <- [ {text}, Трали вали ]</a>
        <div class="rbseo"></div>
      ';

      function init () {
        var div = document.createElement('div');
        div.innerHTML = html;
        var _textNodes = {};
        var f = document.createDocumentFragment();
        var root = div.childNodes[0];
        [
          { text:'', type: 'text', name: 'text2' },
          { text: 'Трали вали', type: 'text' }
        ].each(function(i) {
          var textNode = document.createTextNode(i.text);
          f.appendChild(textNode);
          if (i.name) {
            _textNodes[i.name] = textNode;
          }
        })
        root.replaceChild(root.childNodes[1], f)
        return root;
      }

      return new template({
        html: html,
        init: init
      });


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
