return function (params) {
  var __params0__ = {}                 
var __params1__ = {}                 
$.extend(__params1__, {some: 'data'})              
var __params2__ = {}                 
$.extend(__params2__, {a: 1, b:2})              
;__params2__.html = "<div class=\"a\">1</div>"__params2__.data = params;__params2__.data2 = (params.text ? 1 : 2);
var __params3__ = {a:1, b:2}                 
var __expr4__= params.test ? 'name4' : 'name5' 
var __params4__ = {}                 
$.extend(__params4__, {some: 'data'})              
  return name0(__params0__)                        ..name1(__params1__)                        ..name2(__params2__)                        ..name3(__params3__)                        ..__expr4__(__params4__)                        
}
