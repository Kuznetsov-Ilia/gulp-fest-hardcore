return function (params) {
  var __params0__ = {}               
$.extend(__params0__, {some: 'data'})              
var __params1__ = {}               
$.extend(__params1__, {a: 1, b:2})              
;__params1__.html = "<div class=\"a\">1</div>"
var __params2__ = {a:1, b:2}               
var __params3__ = {a:1, b:2}               
$.extend(__params3__, {a:2,b:3,c:4})              
var __params4__ = {}               
$.extend(__params4__, {some: 'data'})              
  return require("templates.name0")(__params0__)                                 ..require("templates.name1")(__params1__)                                 ..require("templates.name2")(__params2__)                                 ..require("templates.name3")(__params3__)                                 ..require( params.test ? 'name4' : 'name5' )(__params4__)                                 
}
