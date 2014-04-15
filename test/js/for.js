module.exports = function (params) {
  var __expr0__ = "";
  if (params.items && params.items.length) {
    for (var i = 0, il = params.items.length; i < il; i++) {
      var ii = params.items[i];
      __expr0__ += params.items[i]
    }
  };
  var __expr1__ = "";
  if (params.items && params.items.length) {
    for (var i = 0, il = params.items.length; i < il; i++) {
      var v = params.items[i];
      __expr1__ += v
    }
  } else if (foo) {
    __expr1__ = "foo text"
  } else if (bar) {
    __expr1__ = "bar text"
  } else {
    __expr1__ = "else text"
  }
  return __expr0__ + __expr1__
}