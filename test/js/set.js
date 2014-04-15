module.exports = function (params) {
  function name0(params) {
    return ""
  };

  function name1(myparams) {
    return "<div class=\"" + $.escapeHTML(params.className) + "\">"
    params.text + "</div>"
  };

  function name2(params) {
    return "<div class=\"" + $.escapeHTML(params.className) + "\">"
    params.text + "</div>"
  };

  function name(params) {
    return "John"
  };

  function full_name(params) {
    var __params0__ = {}
    return name(__params0__) + " F. Kennedy"
  };

  function line(params) {
    return "Hello, "
    params.username + "!"
  };
  var __params1__ = {};
  $.extend(__params1__, {
    username: "John"
  });

  function host(params) {
    return "http:\/\/e.mail.ru"
  };

  function all(params) {
    return "msglist"
  };

  function _new(params) {
    return "sentmsg?compose"
  };

  function all_link(params) {
    var __params2__ = {};
    var __params3__ = {}
    return host(__params2__) + "\/" + all(__params3__)
  };

  function new_link(params) {
    var __params4__ = {};
    var __params5__ = {}
    return host(__params4__) + "\/" + _new(__params5__)
  }
  return line(__params1__)
}