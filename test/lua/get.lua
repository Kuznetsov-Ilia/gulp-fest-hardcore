return function (params)
  local __params0__ = {}                 
local __params1__ = {}                 
U.extend(__params1__, {some: 'data'})              
local __params2__ = {}                 
U.extend(__params2__, {a: 1, b:2})              
;__params2__.html = "<div class=\"a\">1</div>"__params2__.data = params;__params2__.data2 = (params.text ? 1 : 2);
local __params3__ = {a:1, b:2}                 
var __expr4__= params.test ? 'name4' : 'name5' 
local __params4__ = {}                 
U.extend(__params4__, {some: 'data'})              
  return name0(__params0__)                        ..name1(__params1__)                        ..name2(__params2__)                        ..name3(__params3__)                        ..__expr4__(__params4__)                        
end
