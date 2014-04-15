module.exports = function (params) {
  var __params0__ = {};
  $.extend(__params0__, {
    some: 'data'
  });
  var __params1__ = {};
  $.extend(__params1__, {
    a: 1,
    b: 2
  });;
  __params1__.html = "<div class=\"a\">1</div>";
  var __params2__ = {
    a: 1,
    b: 2
  };
  var __params3__ = {
    a: 1,
    b: 2
  };
  $.extend(__params3__, {
    a: 2,
    b: 3,
    c: 4
  });
  var __params4__ = {};
  $.extend(__params4__, {
    some: 'data'
  })
  return require("name0-template")(__params0__) + require("name1-template")(__params1__) + require("name2-template")(__params2__) + require("name3-template")(__params3__) + require(params.test ? 'name4' : 'name5')(__params4__)
}