return function (params)
  local __params0__ = {}               
U.extend(__params0__, {some: 'data'})              
local __params1__ = {}               
U.extend(__params1__, {a: 1, b:2})              
;__params1__.html = "<div class=\"a\">1</div>"
local __params2__ = {a:1, b:2}               
local __params3__ = {a:1, b:2}               
U.extend(__params3__, {a:2,b:3,c:4})              
local __params4__ = {}               
U.extend(__params4__, {some: 'data'})              
  return require("templates.name0")(__params0__)                                 ..require("templates.name1")(__params1__)                                 ..require("templates.name2")(__params2__)                                 ..require("templates.name3")(__params3__)                                 ..require( params.test ? 'name4' : 'name5' )(__params4__)                                 
end
