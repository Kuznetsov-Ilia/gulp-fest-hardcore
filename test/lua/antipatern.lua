return function (params) {
  local __expr0__ = ""
                             
if params.c then
                               
  
                              
  __expr0__ = "fail"
                           
end


params.d = params.a - params.b

local __expr1__ = ""
                             
if params.d then
                               
  
                              
  __expr1__ = "good"
                           
end

  return ((params.c = params.a + params.b, params.c))..__expr0__..__expr1__
}
